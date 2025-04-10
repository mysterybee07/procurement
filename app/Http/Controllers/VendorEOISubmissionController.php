<?php

namespace App\Http\Controllers;
use App\Http\Requests\VendorSubmissionRequest;
use App\Models\EOI;
use App\Models\Vendor;
use App\Models\VendorEOIDocument;
use App\Models\VendorEOISubmission;
use App\Models\VendorSubmittedItems;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Log;
use Yajra\DataTables\DataTables;

class VendorEOISubmissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $vendor = Auth::user()->vendor;
    
        // Check if request is an AJAX request for DataTables
        if ($request->ajax() && $request->expectsJson()) {
            $submittedEois = DB::table('vendor_eoi_submissions as v')
                ->leftJoin('eois as e', 'v.eoi_id', '=', 'e.id')
                ->where('v.vendor_id', $vendor->id)
                ->select([
                    'v.id',
                    'v.vendor_id',
                    'v.eoi_id',
                    'e.eoi_number',
                    'v.submission_date',
                    'v.delivery_date',
                    'v.status',
                    'v.items_total_price'
                ]);
    
            return DataTables::of($submittedEois)
                // Make all columns searchable
                ->filterColumn('eoi_number', function($query, $keyword) {
                    $query->where('e.eoi_number', 'like', "%{$keyword}%");
                })
                ->filterColumn('submission_date', function($query, $keyword) {
                    $query->where('v.created_at', 'like', "%{$keyword}%");
                })
                ->filterColumn('delivery_date', function($query, $keyword) {
                    $query->where('v.delivery_date', 'like', "%{$keyword}%");
                })
                ->filterColumn('status', function($query, $keyword) {
                    $query->where('v.status', 'like', "%{$keyword}%");
                })
                ->filterColumn('items_total_price', function($query, $keyword) {
                    $query->where('v.items_total_price', 'like', "%{$keyword}%");
                })
                // Format dates for better readability
                // ->editColumn('submission_date', function($row) {
                //     return \Carbon\Carbon::parse($row->submission_date)->format('M d, Y H:i');
                // })
                // ->editColumn('delivery_date', function($row) {
                //     return $row->delivery_date ? \Carbon\Carbon::parse($row->delivery_date)->format('M d, Y') : 'N/A';
                // })
                // Format price with currency symbol
                // ->editColumn('items_total_price', function($row) {
                //     return '$' . number_format($row->items_total_price, 2);
                // })
                ->addColumn('actions', function ($row) {
                    return '<a href="/vendor/eoi-submission/'.$row->id.'/details" class="text-blue-500 hover:underline mr-2">View</a>';
                        //    '<a href="/vendor/submitted-eois/'.$row->id.'" class="text-green-500 hover:underline">Details</a>';
                })
                ->rawColumns(['actions'])
                ->toJson();
        }
    
        // Return Inertia response for normal page loads
        return Inertia::render('vendor/vendor-side/list-vendor-submitted-eois', [
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }
    
    /**
     * Show the form for creating a new resource.
     */
    public function create($eoiId)
    {
        $eoi = EOI::with([
            'documents',
            'requisitions.requestItems.product.category'
        ])->findOrFail($eoiId);
    
        $requestItems = $eoi->requisitions->flatMap(function ($requisition) {
            return $requisition->requestItems;
        });
    
        // Transform request items with direct category reference
        $transformedRequestItems = $requestItems->map(function ($item) {
            return [
                'id' => $item->id,
                'required_quantity' => $item->required_quantity - ($item->provided_quantity ?? 0),
                'additional_specifications' => $item->additional_specifications,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                ],
                'category' => $item->product->category ? [
                    'id' => $item->product->category->id,
                    'category_name' => $item->product->category->category_name,
                ] : null,
                'provided_quantity' => $item->provided_quantity
            ];
        })->values();
    
        return Inertia::render('vendor/vendor-side/eoi-submission-form', [
            'requestItems' => $transformedRequestItems,
            'documents' => $eoi->documents->map(function ($document) {
                return [
                    'id' => $document->id,
                    'name' => $document->name,
                    'file_path' => $document->file_path,
                ];
            }),
            'eoi_id' => $eoi->id,
            'eoi_number' => $eoi->eoi_number,
            'vendor_id' => auth()->id(),
            'vendor_name' => auth()->user()->name,
            'vendor_address' => auth()->user()->address,
            'allow_partial_item_submission' => $eoi->allow_partial_item_submission ?? false,
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
    
            // Check for existing submission
            $existingSubmission = VendorEoiSubmission::where('eoi_id', $request->eoi_id)
                                                      ->where('vendor_id', $vendor->id)
                                                      ->first();
            if ($existingSubmission) {
                return back()->withErrors(['error' => 'The vendor has already submitted for this EOI.']);
            }
    
            // Handle terms & conditions file upload
            $termsAndConditionsPath = null;
            if ($request->hasFile('terms_and_conditions')) {
                $termsAndConditionsPath = $request->file('terms_and_conditions')->store(
                    "terms_and_conditions/{$request->eoi_id}", 'public'
                );
            }
    
            // Create main submission
            $submission = VendorEoiSubmission::create([
                'eoi_id' => $request->eoi_id,
                'vendor_id' => $vendor->id,
                'submission_date' => $request->submission_date,
                'delivery_date' => $request->delivery_date,
                'remarks' => $request->remarks,
                'terms_and_conditions' => $termsAndConditionsPath,
                'items_total_price' => $request->items_total_price,
                'status' => $request->status ?? 'submitted',
            ]);
    
            // Handle submitted items
            $submittedItems = $request->input('submittedItems', []);
            foreach ($submittedItems as $item) {
                if (!empty($item['request_items_id'])) {
                    VendorSubmittedItems::create([
                        'vendor_eoi_submission_id' => $submission->id,
                        'request_items_id' => $item['request_items_id'],
                        'actual_unit_price' => $item['actual_unit_price'],
                        'actual_product_total_price' => $item['actual_product_total_price'],
                        'discount_rate' => $item['discount_rate'] ?? null,
                        'submitted_quantity' => $item['submitted_quantity'],
                        'additional_specifications' => $item['additional_specifications'] ?? null,
                    ]);
                }
            }
    
            // Handle submitted documents (fix for nested FormData structure)
            $submittedDocuments = $request->input('submittedDocuments', []);
            foreach ($submittedDocuments as $index => $doc) {
                $uploadedFile = $request->file("submittedDocuments.$index.file");
                $documentId = $doc['document_id'] ?? null;
    
                if ($uploadedFile && $uploadedFile->isValid()) {
                    $path = $uploadedFile->store("eoi_documents/{$request->eoi_id}", 'public');
    
                    VendorEoiDocument::create([
                        'document_id' => $documentId,
                        'vendor_id' => $vendor->id,
                        'eoi_submission_id' => $submission->id,
                        'file_path' => $path,
                    ]);
                }
            }
    
            DB::commit();
            return redirect()->route('vendoreois.index')->with('message', 'EOI submitted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('EOI submission error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Failed to submit EOI: ' . $e->getMessage());
        }
    }  

    /**
     * Display the specified resource.
     */
    public function show($submissionId)
    {
        $submission = VendorEoiSubmission::with([
            'vendor',
            'eoi',
            'vendorSubmittedItems.requestItem.product',
        ])->findOrFail($submissionId);
        // dd($submission);
        return Inertia::render('eoi/eoi-submitted-details', [
            'submission' => $submission,
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ],
        ]);
    }


    // Close the submission
    public function closeEOI(EOI $eoi)
    {
        if ($eoi->status!=='opened') {
            return redirect()->back()
                ->with('error', 'EOI cannot be published because it has not been approved.');
        }

        $eoi->update([
            'status' => 'closed',
            'submission_deadline' => now(),
            // 'publish_date' => now(),
        ]);

        return redirect()->back()
            ->with('message', 'EOI submission closed successfully.');
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
