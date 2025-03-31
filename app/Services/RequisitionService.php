<?php

namespace App\Services;

use App\Models\Requisition;
use App\Repositories\Interfaces\RequisitionInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class RequisitionService
{
    protected $requisitionRepository;

    public function __construct(RequisitionInterface $requisitionRepository)
    {
        $this->requisitionRepository = $requisitionRepository;
    }

    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->requisitionRepository->getAllPaginated($perPage);
    }

    public function getById(int $id): ?Requisition
    {
        return $this->requisitionRepository->getById($id);
    }

    public function create(array $validatedData): Requisition
    {
        $data = $validatedData;
        $data['requester'] = Auth::id();
        
        return $this->requisitionRepository->create($data);
    }

    public function update(Requisition $requisition, array $validatedData): bool
    {
        return $this->requisitionRepository->update($requisition, $validatedData);
    }

    public function delete(Requisition $requisition): bool
    {
        // Optional: Add business logic to check if deletion is allowed
        if ($requisition->status !== 'draft' && $requisition->status !== 'rejected') {
            throw new \Exception('Requisition has already been submitted. Now you cannot delete it');
        }
        
        return $this->requisitionRepository->delete($requisition);
    }

    public function submitRequisition(Requisition $requisition): bool
    {
        return $this->requisitionRepository->submitRequisition($requisition);
    }

    public function fulfillRequisitionItem(int $id, int $providedQuantity): array
    {
        return $this->requisitionRepository->fulfillRequisitionItem($id, $providedQuantity);
    }

    public function receiveRequisitionItem(int $id): bool
    {
        return $this->requisitionRepository->receiveRequisitionItem($id);
    }

    public function canEditRequisition(Requisition $requisition): bool
    {
        $user = Auth::user();
        
        // Only draft or rejected requisitions can be edited
        if (!in_array($requisition->status, ['draft', 'rejected'])) {
            return false;
        }
        
        // Only the creator can edit their requisition
        if ($requisition->requester !== $user->id && !$user->can('edit any requisition')) {
            return false;
        }
        
        return true;
    }
}