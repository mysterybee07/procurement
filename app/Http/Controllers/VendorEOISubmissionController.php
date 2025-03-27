<?php

namespace App\Http\Controllers;

use App\Models\EOI;
use App\Models\VendorEOISubmission;
use App\Models\VendorSubmittedItems;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VendorEOISubmissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create($eoiId)
    {
        $eoi = EOI::with('documents', 'requisitions.requestItems.product')->findOrFail($eoiId);

        $requestItems = $eoi->requisitions->flatMap(function ($requisition) {
            return $requisition->requestItems;
        });

        $transformedRequestItems = $requestItems->map(function ($item) {
            return [
                'id' => $item->id,
                'required_quantity' => $item->required_quantity,
                'additional_specifications' => $item->additional_specifications ?? null,
                'product' => [
                    'id'   => $item->product->id,
                    'name' => $item->product->name,
                ],
            ];
        })->values();

        $transformedDocuments = $eoi->documents->map(function ($document) {
            return [
                'id' => $document->id,
                'name' => $document->name,
                'file_path' => $document->file_path,
                // 'type' => $document->type,
            ];
        })->values();

        return Inertia::render('vendor/vendor-side/eoi-submission-form', [
            'requestItems' => $transformedRequestItems,
            'documents' => $transformedDocuments,
            'eoi_id'    => $eoi->id,
            'vendor_id' => auth()->id(),
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    // public function store(Request $request)
    // {
    //     //
    // }
    public function store(Request $request, $eoi_id)
    {
        $validatedData = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'delivery_date' => 'required|date|after:today',
            'status' => 'in:draft,submitted',
            'terms_and_conditions' => 'nullable|string',
            'remarks' => 'nullable|string',
            'vendorSubmittedItems' => 'required|array',
            'vendorSubmittedItems.*.request_items_id' => 'required|exists:request_items,id',
            // 'vendorSubmittedItems.*.can_provide' => 'boolean',
            'vendorSubmittedItems.*.actual_unit_price' => 'numeric|min:0',
            'vendorSubmittedItems.*.discount_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        // Begin database transaction
        DB::beginTransaction();

        try {
            // Calculate total price
            $itemsToSubmit = collect($validatedData['vendorSubmittedItems'])
                ->where('can_provide', true);

            $totalPrice = $itemsToSubmit->sum(function ($item) {
                $unitPrice = $item['actual_unit_price'];
                $quantity = $item['required_quantity'];
                $discountRate = $item['discount_rate'] ?? 0;
                
                // Apply discount
                $finalUnitPrice = $unitPrice * (1 - ($discountRate / 100));
                
                return $finalUnitPrice * $quantity;
            });

            // Create or update submission
            $submission = VendorEOISubmission::updateOrCreate(
                [
                    'eoi_id' => $eoi_id,
                    'vendor_id' => $validatedData['vendor_id'],
                    'status' => $validatedData['status']
                ],
                [
                    'submission_date' => now(),
                    'delivery_date' => $validatedData['delivery_date'],
                    'terms_and_conditions' => $validatedData['terms_and_conditions'],
                    'remarks' => $validatedData['remarks'],
                    'items_total_price' => $totalPrice,
                ]
            );

            // Delete existing submitted items
            $submission->vendorSubmittedItems()->delete();

            // Create new submitted items
            $submittedItems = $itemsToSubmit->map(function ($item) use ($submission) {
                return new VendorSubmittedItems([
                    'request_items_id' => $item['request_items_id'],
                    'product_name' => $item['product_name'],
                    'required_quantity' => $item['required_quantity'],
                    'actual_unit_price' => $item['actual_unit_price'],
                    'discount_rate' => $item['discount_rate'] ?? null,
                    'can_provide' => true,
                    'actual_product_total_price' => 
                        $item['actual_unit_price'] * 
                        $item['required_quantity'] * 
                        (1 - (($item['discount_rate'] ?? 0) / 100))
                ]);
            });

            // Save submitted items
            $submission->vendorSubmittedItems()->saveMany($submittedItems);

            // Commit transaction
            \DB::commit();

            // Redirect based on submission status
            return redirect()
                ->route('vendor.eoi.submissions.index')
                ->with('success', $submission->status === 'submitted' 
                    ? 'EOI Submission submitted successfully' 
                    : 'EOI Draft saved successfully');

        } catch (\Exception $e) {
            // Rollback transaction
            \DB::rollBack();

            // Log error
            \Log::error('EOI Submission Error: ' . $e->getMessage());

            // Redirect back with error
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to submit EOI']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(VendorEOISubmission $vendorEOISubmission)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(VendorEOISubmission $vendorEOISubmission)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, VendorEOISubmission $vendorEOISubmission)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VendorEOISubmission $vendorEOISubmission)
    {
        //
    }
}
