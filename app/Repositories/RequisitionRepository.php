<?php

namespace App\Repositories;

use App\Http\Requests\RequisitionRequest;
use App\Models\Requisition;
use App\Models\Product;
use App\Models\RequestItem;
use App\Repositories\Interfaces\RequisitionInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class RequisitionRepository implements RequisitionInterface
{
    public function getAllPaginated(int $perPage): LengthAwarePaginator
    {
        $user = Auth::user();

        if ($user->can('fulfill requisitionItem')) {
            return Requisition::with('requester', 'requestItems.product')
                ->where(function ($query) use ($user) {
                    $query->where('status', '!=', 'draft')
                        ->orWhere('requester', $user->id);
                })
                ->paginate($perPage);
        } else {
            // Show only requisitions created by the logged-in user (all statuses)
            return Requisition::where('requester', $user->id)
                ->with('requester', 'requestItems', 'requestItems.product')
                ->paginate($perPage);
        }
    }

    public function getById(int $id): ?Requisition
    {
        return Requisition::with('requester', 'requestItems.product')->findOrFail($id);
    }

    public function create(array $data): Requisition
    {
        try {
            DB::beginTransaction();

            // Fetch all product names in a single query
            $productIds = array_column($data['requestItems'], 'product_id');
            $products = Product::whereIn('id', $productIds)->pluck('name', 'id');

            // Determine the title
            $title = $data['title'] ?? 'Required: ' . implode(', ', array_map(
                fn($item) => $products[$item['product_id']] ?? 'Unknown Product',
                $data['requestItems']
            ));

            $requisition = Requisition::create([
                'title' => $title,
                'required_date' => $data['required_date'],
                'requester' => $data['requester'],
                'status' => $data['status'],
                'urgency' => $data['urgency'],
            ]);

            $requestItems = array_map(fn($item) => [
                'requisition_id' => $requisition->id,
                'required_quantity' => $item['required_quantity'],
                'additional_specifications' => $item['additional_specifications'],
                'product_id' => $item['product_id'],
            ], $data['requestItems']);

            // Bulk insert for efficiency
            RequestItem::insert($requestItems);

            DB::commit();
            return $requisition;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function update(Requisition $requisition, array $data): bool
    {
        try {
            DB::beginTransaction();

            // Update the requisition
            $requisition->update([
                'title' => $data['title'],
                'required_date' => $data['required_date'],
                'status' => $data['status'],
                'urgency' => $data['urgency'],
            ]);

            // Delete existing request items
            $requisition->requestItems()->delete();

            // Create new request items
            foreach ($data['requestItems'] as $item) {
                RequestItem::create([
                    'requisition_id' => $requisition->id,
                    'required_quantity' => $item['required_quantity'],
                    'additional_specifications' => $item['additional_specifications'],
                    'product_id' => $item['product_id'],
                ]);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete(Requisition $requisition): bool
    {
        try {
            DB::beginTransaction();
            $requisition->delete();
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function submitRequisition(Requisition $requisition): bool
    {
        $requisition->status = 'submitted';
        return $requisition->save();
    }

    public function fulfillRequisitionItem(int $id, int $providedQuantity): array
    {
        try {
            DB::beginTransaction();

            $requestItem = RequestItem::findOrFail($id);
            $product = Product::findOrFail($requestItem->product_id);
            $previouslyProvidedQuantity = $requestItem->provided_quantity;
            $requisition = $requestItem->requisition;

            if ($product->in_stock_quantity < $providedQuantity) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => 'Not enough stock available.'
                ];
            }

            // Deduct the stock
            $product->in_stock_quantity -= $providedQuantity;
            $product->save();

            // Update request item
            $requestItem->provided_quantity = $providedQuantity + $previouslyProvidedQuantity;
            $requestItem->status = ($requestItem->provided_quantity === $requestItem->required_quantity)
                ? 'provided'
                : 'partially provided';
            $requestItem->save();

            // Check if all items are provided
            if ($requisition->requestItems()->where('status', '!=', 'provided')->count() === 0) {
                $requisition->status = 'provided';
                $requisition->save();
            }

            DB::commit();
            return [
                'success' => true,
                'message' => 'Requisition fulfilled successfully.'
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function receiveRequisitionItem(int $id): bool
    {
        try {
            DB::beginTransaction();

            $requestItem = RequestItem::findOrFail($id);
            $requisition = $requestItem->requisition;
            
            $requestItem->status = 'received';
            $requestItem->save();
            
            // Check if all items are received
            if ($requisition->requestItems()->where('status', '!=', 'received')->count() === 0) {
                $requisition->status = 'fulfilled';
                $requisition->save();
            }
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}