<?php

namespace App\Http\Controllers;

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
        //
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
    // public function store(Request $request)
    // {
    //     //
    // }
    public function store(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'eoi_id' => 'required|exists:eois,id',
            'vendor_id' => 'required|exists:users,id',
            'submission_date' => 'required|date',
            'delivery_date' => 'required|date',
            'remarks' => 'nullable|string',
            'terms_and_conditions' => 'nullable|file|mimes:pdf,doc,docx|max:10240', // 10MB max
            'items_total_price' => 'required|numeric|min:0',
            'submittedItems' => 'required|array|min:1',
            'submittedItems.*.request_items_id' => 'required|exists:request_items,id',
            'submittedItems.*.actual_unit_price' => 'required|numeric|min:0',
            'submittedItems.*.actual_product_total_price' => 'required|numeric|min:0',
            'submittedItems.*.discount_rate' => 'nullable|numeric|min:0|max:100',
            'submittedItems.*.additional_specifications' => 'nullable|string',
            'submittedDocuments' => 'required|array',
            'submittedDocuments.*.document_id' => 'required|exists:documents,id',
            'submittedDocuments.*.file' => 'nullable|file|max:10240', // 10MB max
        ]);
    
        try {
            DB::beginTransaction();
            $vendor = Vendor::where('user_id',$request->vendor_id)->first();
            if (!$vendor) {
                return back()->withErrors(['vendor_id' => 'The selected user is not a registered vendor.']);
            }
            
            // Ensure storage directories exist
            $termsPath = storage_path('app/public/terms_and_conditions');
            $docsPath = storage_path('app/public/eoi_documents');
            
            if (!file_exists($termsPath)) {
                mkdir($termsPath, 0755, true);
            }
            
            if (!file_exists($docsPath)) {
                mkdir($docsPath, 0755, true);
            }
            
            // Handle terms and conditions file upload
            $termsAndConditionsPath = null;
            if ($request->hasFile('terms_and_conditions')) {
                $termsAndConditionsPath = $request->file('terms_and_conditions')->store('terms_and_conditions', 'public');
            }
            
            // Create vendor EOI submission
            $submission = VendorEoiSubmission::create([
                'eoi_id' => $request->eoi_id,
                'vendor_id' => $vendor->id,
                'submission_date' => $request->submission_date,
                'delivery_date' => $request->delivery_date,
                'remarks' => $request->remarks,
                'terms_and_conditions' => $termsAndConditionsPath,
                'items_total_price' => $request->items_total_price,
                'status' => 'submitted', // Set initial status
            ]);
            
            // Process submitted items
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
            
            // Process submitted documents
            foreach ($request->file('submittedDocuments', []) as $index => $fileData) {
                if (isset($fileData['file']) && $fileData['file']->isValid()) {
                    $filePath = $fileData['file']->store('eoi_documents', 'public');
                    
                    VendorEoiDocument::create([
                        'document_id' => $request->input("submittedDocuments.{$index}.document_id"),
                        'vendor_id' => $request->vendor_id,
                        'eoi_submission_id' => $submission->id,
                        'file_path' => $filePath,
                        'status' => 'submitted',
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'EOI submission created successfully',
                'data' => $submission
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create EOI submission',
                'error' => $e->getMessage()
            ], 500);
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
