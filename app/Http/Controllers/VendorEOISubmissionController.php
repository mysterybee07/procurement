<?php

namespace App\Http\Controllers;
use App\Http\Requests\VendorSubmissionRequest;
use App\Models\EOI;
use App\Models\Vendor;
use App\Models\VendorEOIDocument;
use App\Models\VendorEOISubmission;
use App\Models\VendorSubmittedItems;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Log;

class VendorEOISubmissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create($eoiId)
    {
        // dd($eoiId);
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
            'eoi_number'=>$eoi->eoi_number,
            'vendor_id' => auth()->id(),            
            'vendor_name' => auth()->user()->name, 
            'vendor_address' => auth()->user()->address, 
                // 'contact' => auth()->user()->contact_number,
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(VendorSubmissionRequest $request)
    {
        try {
            DB::beginTransaction();
    
            $vendor = Vendor::where('user_id', $request->vendor_id)->first();
            if (!$vendor) {
                return back()->withErrors(['error' => 'The selected user is not a registered vendor.']);
            }
    
            // Check if the vendor has already submitted this EOI
            $existingSubmission = VendorEoiSubmission::where('eoi_id', $request->eoi_id)
                                                      ->where('vendor_id', $vendor->id)
                                                      ->first();
            if ($existingSubmission) {
                return back()->withErrors(['error' => 'The vendor has already submitted for this EOI.']);
            }
    
            $termsAndConditionsPath = handleFileUpload($request, 'terms_and_conditions', 'terms_and_conditions', $request->eoi_id);
    
            $submission = VendorEoiSubmission::create([
                'eoi_id' => $request->eoi_id,
                'vendor_id' => $vendor->id,
                'submission_date' => $request->submission_date,
                'delivery_date' => $request->delivery_date,
                'remarks' => $request->remarks,
                'terms_and_conditions' => $termsAndConditionsPath,
                'items_total_price' => $request->items_total_price,
                'status' => 'submitted',
            ]);
    
            foreach ($request->submittedItems as $item) {
                VendorSubmittedItems::create([
                    'vendor_eoi_submission_id' => $submission->id,
                    'request_items_id' => $item['request_items_id'],
                    'actual_unit_price' => $item['actual_unit_price'],
                    'actual_product_total_price' => $item['actual_product_total_price'],
                    'discount_rate' => $item['discount_rate'] ?? null,
                    'additional_specifications' => $item['additional_specifications'] ?? null,
                ]);
            }
    
            foreach ($request->submittedDocuments as $index => $doc) {
                $documentId = $doc['document_id'];
                $filePath = handleFileUpload($request, "submittedDocuments.$index.file", 'eoi_documents', $request->eoi_id);
    
                if ($filePath) {
                    VendorEoiDocument::create([
                        'document_id' => $documentId,
                        'vendor_id' => $vendor->id,
                        'eoi_submission_id' => $submission->id,
                        'file_path' => $filePath,
                    ]);
                }
            }
    
            DB::commit();
            return redirect()->route('vendoreois.index')->with('message', 'EOI submitted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('EOI submission error', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'EOI submitted successfully');
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
