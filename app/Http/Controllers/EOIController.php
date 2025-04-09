<?php

namespace App\Http\Controllers;

use App\Http\Requests\EOIRequest;
use App\Models\ApprovalWorkflow;
use App\Models\Document;
use App\Models\EOI;
use App\Models\Product;
use App\Models\Requisition;
use DB;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Yajra\DataTables\DataTables;
use function PHPUnit\Framework\returnValueMap;

class EOIController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('permission:view eois', only: ['index']),
            new Middleware('permission:create eois', only: ['create']),
            new Middleware('permission:edit eois', only: ['edit']),
            new Middleware('permission:delete eois', only: ['destroy']),
            new Middleware('permission:publish eois', only:['publishEOI']),
        ];
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->ajax() && $request->expectsJson()) {
            $eois = DB::table('eois as e')
                ->leftJoin('users as u', 'e.created_by', '=', 'u.id')
                ->select([
                    'e.id',
                    'e.eoi_number',
                    'e.title',
                    'e.status',
                    'e.created_at',
                    'e.submission_deadline',
                    'u.id as creator_id',
                    'u.name as created_by'
                ]);

            return DataTables::of($eois)
                ->addColumn('requisitions_count', function ($row) {
                    return DB::table('requisitions')
                        ->where('eoi_id', $row->id)
                        ->count();
                })
                ->addColumn('actions', function ($row) {
                    $actions = '<a href="' . route('eois.show', $row->id) . '" class="text-indigo-600 hover:text-indigo-900 mr-2">View Details</a>';
                    $actions .= '<a href="' . route('eois.edit', $row->id) . '" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</a>';
                    $actions .= '<button data-id="' . $row->id . '" class="text-red-600 hover:text-red-900 mr-2 delete-eoi">Delete</button>';
                    $actions .= '<a href="' . route('eoisubmission.list', $row->id) . '" class="text-indigo-600 hover:text-indigo-900">View Submissions</a>';
                    
                    return $actions;
                })
                ->filterColumn('eoi_number', function($query, $keyword) {
                    $query->where('e.eoi_number', 'like', "%{$keyword}%");
                })
                ->filterColumn('title', function($query, $keyword) {
                    $query->where('e.title', 'like', "%{$keyword}%");
                })
                ->filterColumn('status', function($query, $keyword) {
                    $query->where('e.status', 'like', "%{$keyword}%");
                })
                ->rawColumns(['actions'])
                ->toJson();
        }

        return Inertia::render('eoi/list-eois', [
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $requisitions = [];
        $products = Product::all();
        $requiredDocuments = Document::all();

        // if ($request->has('requisition_ids') && !empty($request->requisition_ids)) {
        //     $requisitionIds = $request->requisition_ids;
        //     $requisitions = Requisition::whereIn('id', $requisitionIds)->get();
        // }

        return Inertia::render('eoi/eoi-form', [
            'products' => $products,
            'requisitions' => $requisitions,
            'requiredDocuments' => $requiredDocuments
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(EOIRequest $request)
    {
        // dd($request);
        
        $requestData = $request->validated();

        // dd($requestData);

        // if ($requestData->fails()) {
        //     return redirect()->back()->withErrors($requestData)->withInput();
        // }
              
        $eoiNumber = 'EOI-' . date('Y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);

        // Create the EOI
        $eoi = EOI::create([
            'title' => $requestData['title'],
            'description' => $requestData['description'],
            'evaluation_criteria' => $requestData['evaluation_criteria'],
            'allow_partial_item_submission' => $requestData['allow_partial_item_submission'] ?? false,
            // 'approval_workflow_id' => $requestData['approval_workflow_id'],
            'status' => $requestData['status'] ?? 'draft',
            'eoi_number' => $eoiNumber,
            'created_by' => auth()->id(),
        ]);
        // $documents = Document::all();

        if (!empty($requestData['documents'] ?? null)) {
            $eoi->documents()->sync($requestData['documents']);
        }        

        // Update eoi id on requisition table
        if (!empty($requestData['requisition_ids'])) {
            Requisition::whereIn('id', $requestData['requisition_ids'])
                ->update(['eoi_id' => $eoi->id]);
        }
        
        return redirect()->route('eois.index', $eoi->id)
            ->with('message', 'Expression of Interest created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(EOI $eoi)
    {
        $eoi->load('createdBy', 'documents', 'requisitions.requestItems.product.category');
        $approvalWorkflows=ApprovalWorkflow::select('id','workflow_name')->get();

        $aggregatedItems = [];

        foreach ($eoi->requisitions as $requisition) {
            foreach ($requisition->requestItems as $item) {
                if ($item->provided_quantity >= $item->required_quantity) {
                    continue;
                }

                $productId = $item->product->id;

                if (!isset($aggregatedItems[$productId])) {
                    $aggregatedItems[$productId] = [
                        'name' => $item->product->name,
                        'unit' => $item->product->unit,
                        'category' => $item->product->category->category_name,
                        'required_quantity' => 0, 
                    ];
                }

                // Add the remaining quantity needed
                $aggregatedItems[$productId]['required_quantity'] += ($item->required_quantity - $item->provided_quantity);
            }
        }
        // dd($aggregatedItems);
        return Inertia::render('eoi/eoi-details', [
            'eoi' => $eoi,
            'aggregatedItems' => array_values($aggregatedItems),
            'approvalWorkflows'=>$approvalWorkflows, 
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EOI $eoi)
    {
        $eoi->load('documents', 'requisitions');
        $products = Product::all();
        $requiredDocuments = Document::all();
        
        return Inertia::render('eoi/eoi-form', [
            'eoi' => $eoi,
            'products' => $products,
            'requisitions' => $eoi->requisitions,
            'requiredDocuments' => $requiredDocuments,
            'isEditing' => true
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(EOIRequest $request, EOI $eoi)
    {
        $requestData = $request->validated();
        // dd($requestData);
        
        $eoi->update([
            'title' => $requestData['title'],
            'description' => $requestData['description'],
            // 'submission_deadline' => $requestData['submission_deadline'],
            'evaluation_criteria' => $requestData['evaluation_criteria'],
            'allow_partial_item_submission' => $requestData['allow_partial_item_submission'] ?? false,
            'status' => $requestData['status'] ?? $eoi->status,
        ]);
        
        // Update documents
        if (isset($requestData['documents'])) {
            $eoi->documents()->sync($requestData['documents']);
        }
        
        // Update requisitions
        if (isset($requestData['requisition_ids'])) {
            // First, clear existing requisitions
            Requisition::where('eoi_id', $eoi->id)
                ->update(['eoi_id' => null]);
                
            // Then, assign new requisitions
            Requisition::whereIn('id', $requestData['requisition_ids'])
                ->update(['eoi_id' => $eoi->id]);
        }
        
        return redirect()->route('eois.show', $eoi->id)
            ->with('message', 'Expression of Interest updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EOI $eoi)
    {
        //remove EOI reference from requisitions
        Requisition::where('eoi_id', $eoi->id)
            ->update(['eoi_id' => null]);
            
        // Detach documents
        $eoi->documents()->detach();
        
        // Delete the EOI
        $eoi->delete();
        
        return redirect()->route('eois.index')
            ->with('message', 'Expression of Interest deleted successfully.');
    }

    public function openEOI(Request $request, EOI $eoi)
    {
        $request->validate([
            'submission_deadline' => 'required|date|after:today',
        ]);

        // dd($request);
        if ($eoi->status!=='published') {
            return redirect()->back()
                ->with('error', 'EOI cannot be open because it has not been approved.');
        }

        $eoi->update([
            'status' => 'open',
            'eoi_opening_date' => $request['eoi_opening_date'],
        ]);

        return redirect()->back()
            ->with('message', 'EOI published successfully.');
    }
    public function publishEOI(Request $request, EOI $eoi)
    {
        $request->validate([
            'submission_deadline' => 'required|date|after:today',
        ]);

        if ($eoi->status!=='approved') {
            return redirect()->back()
                ->with('error', 'EOI cannot be published because it has not been approved.');
        }

        $eoi->update([
            'status' => 'published',
            'submission_deadline' => $request['submission_deadline'],
            'publish_date' => now(),
        ]);

        return redirect()->back()
            ->with('message', 'EOI published successfully.');
    }

    // Update Status of EOI to begin_selection
    public function beginVendorSelection($id)
    {
        // dd($id);
        try {
            $eoi = EOI::findOrFail($id);
            $eoi->update(['status' => 'under_selection']);
    
            return redirect()->route('eoisubmission.list')
                ->with('message', 'Vendor has been rated based on their submission. Now you can filter them based on their submission.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to begin vendor selection. Please try again.');
        }
    }    

    // to list vendor based on EOI
    public function listVendorSubmissionByEoi(Request $request, $eoiId)
    {
        $eoi = EOI::select('eoi_number','status')->where('id', $eoiId)->firstOrFail();
        
        if ($request->ajax() && $request->expectsJson()) {
            $submittedEois = DB::table('vendor_eoi_submissions as ves')
                ->leftJoin('vendors as v', 'ves.vendor_id', '=', 'v.id')
                ->leftJoin('users as u', 'v.user_id', '=', 'u.id')
                ->leftJoin('vendor_ratings as vr', 'ves.id', '=', 'vr.vendor_eoi_submission_id')
                ->leftJoin('vendor_submitted_items as vsi', function($join) {
                    $join->on('ves.id', '=', 'vsi.vendor_eoi_submission_id');
                })
                ->leftJoin('request_items as ri', function($join) {
                    $join->on('vsi.request_items_id', '=', 'ri.id');
                })
                ->leftJoin('products as p', 'ri.product_id', '=', 'p.id')
                ->leftJoin('product_categories as pc', 'p.category_id', '=', 'pc.id')
                ->where('ves.eoi_id', $eoiId)
                ->select([
                    'ves.id',
                    'ves.vendor_id',
                    'v.vendor_name',
                    'u.phone',
                    'ves.submission_date',
                    'ves.items_total_price',
                    'ves.delivery_date',
                    'ves.status',
                ]);

                if ($request->filled('product_categories') && is_array($request->product_categories)) {
                    $categoryMatches = DB::table('vendor_submitted_items as vsi_inner')
                        ->join('request_items as ri_inner', 'vsi_inner.request_items_id', '=', 'ri_inner.id')
                        ->join('products as p_inner', 'ri_inner.product_id', '=', 'p_inner.id')
                        ->join('product_categories as pc_inner', 'p_inner.category_id', '=', 'pc_inner.id')
                        ->whereIn('pc_inner.category_name', $request->product_categories)
                        ->groupBy('vsi_inner.vendor_eoi_submission_id')
                        ->havingRaw('COUNT(DISTINCT pc_inner.id) = ?', [count($request->product_categories)])
                        ->select('vsi_inner.vendor_eoi_submission_id');
                
                    $submittedEois->whereIn('ves.id', $categoryMatches);
                }
                
                if ($request->filled('products') && is_array($request->products)) {
                    $productMatches = DB::table('vendor_submitted_items as vsi_inner')
                        ->join('request_items as ri_inner', 'vsi_inner.request_items_id', '=', 'ri_inner.id')
                        ->join('products as p_inner', 'ri_inner.product_id', '=', 'p_inner.id')
                        ->whereIn('p_inner.name', $request->products)
                        ->groupBy('vsi_inner.vendor_eoi_submission_id')
                        ->havingRaw('COUNT(DISTINCT p_inner.id) = ?', [count($request->products)])
                        ->select('vsi_inner.vendor_eoi_submission_id');
                
                    $submittedEois->whereIn('ves.id', $productMatches);
                }               

            // Single product category filter (legacy support)
            if ($request->filled('product_category')) {
                $categoryMatches = DB::table('vendor_submitted_items as vsi_inner')
                    ->join('request_items as ri_inner', 'vsi_inner.request_items_id', '=', 'ri_inner.id')
                    ->join('products as p_inner', 'ri_inner.product_id', '=', 'p_inner.id')
                    ->join('product_categories as pc_inner', 'p_inner.category_id', '=', 'pc_inner.id')
                    ->where('pc_inner.category_name', $request->product_category)
                    ->select('vsi_inner.vendor_eoi_submission_id');
                    
                $submittedEois->whereIn('ves.id', $categoryMatches);
            }

            // Single product filter (legacy support)
            if ($request->filled('product')) {
                $productMatches = DB::table('vendor_submitted_items as vsi_inner')
                    ->join('request_items as ri_inner', 'vsi_inner.request_items_id', '=', 'ri_inner.id')
                    ->join('products as p_inner', 'ri_inner.product_id', '=', 'p_inner.id')
                    ->where('p_inner.name', $request->product)
                    ->select('vsi_inner.vendor_eoi_submission_id');
                    
                $submittedEois->whereIn('ves.id', $productMatches);
            }

            // Rating filter logic (unchanged)
            $orderColumn = 'ves.submission_date';
            if ($request->filled('rating_filter')) {
                switch ($request->rating_filter) {
                    case 'by_documents':
                        $submittedEois->where('vr.document_score', '>', 3);
                        $orderColumn = 'vr.document_score';
                        break;
                    case 'by_submission_completeness':
                        $submittedEois->where('vr.submission_completeness_score', '>', 3);
                        $orderColumn = 'vr.submission_completeness_score';
                        break;
                    case 'by_pricing':
                        $submittedEois->where('vr.total_pricing_score', '>=', 3);
                        $orderColumn = 'vr.total_pricing_score';
                        break;
                    case 'by_delivery':
                        $submittedEois->where('vr.delivery_date_score', '>=', 3);
                        $orderColumn = 'vr.delivery_date_score';
                        break;
                    case 'by_past_performance':
                        $submittedEois->where('vr.past_performance_score', '>=', 3);
                        $orderColumn = 'vr.past_performance_score';
                        break;
                    case 'by_overall_rating':
                        $submittedEois->where('vr.overall_rating', '>=', 3);
                        $orderColumn = 'vr.overall_rating';
                        break;
                }
            }

            // Price range filter (unchanged)
            if ($request->filled('min_price')) {
                $submittedEois->where('ves.items_total_price', '>=', $request->min_price);
            }
            if ($request->filled('max_price')) {
                $submittedEois->where('ves.items_total_price', '<=', $request->max_price);
            }

            // Delivery date range filter (unchanged)
            if ($request->filled('start_delivery_date')) {
                $submittedEois->whereDate('ves.delivery_date', '>=', $request->start_delivery_date);
            }
            if ($request->filled('end_delivery_date')) {
                $submittedEois->whereDate('ves.delivery_date', '<=', $request->end_delivery_date);
            }

            // Group by vendor submission fields only
            $submittedEois->groupBy([
                'ves.id',
                'ves.vendor_id',
                'v.vendor_name',
                'u.phone',
                'ves.submission_date',
                'ves.items_total_price',
                'ves.delivery_date',
                'ves.status',
            ]);

            // Apply ordering in descending order
            $submittedEois->orderByDesc($orderColumn);

            return DataTables::of($submittedEois)
                ->filterColumn('vendor_name', function ($query, $keyword) {
                    $query->where('v.vendor_name', 'like', "%{$keyword}%");
                })
                ->filterColumn('phone', function ($query, $keyword) {
                    $query->where('u.phone', 'like', "%{$keyword}%");
                })
                ->filterColumn('submission_date', function ($query, $keyword) {
                    $query->where('ves.submission_date', 'like', "%{$keyword}%");
                })
                ->filterColumn('delivery_date', function ($query, $keyword) {
                    $query->where('ves.delivery_date', 'like', "%{$keyword}%");
                })
                ->filterColumn('status', function ($query, $keyword) {
                    $query->where('ves.status', 'like', "%{$keyword}%");
                })
                ->addColumn('actions', function ($row) {
                    return '<a href="/eoi-submission/'.$row->id.'/details" class="text-green-500 hover:underline">Details</a>'.' '.
                        '<a href="/vendor/documents/'.$row->vendor_id.'" class="text-blue-500 hover:underline mr-2">View Documents</a>';
                })
                ->rawColumns(['actions'])
                ->toJson();
        }

        return Inertia::render('eoi/list-submissions-by-eoi', [
            'eoi_id' => $eoiId, 
            'eoi_number' => $eoi->eoi_number,
            'eoi_status' => $eoi->status,
            // 'categories' => $categories,
            // 'products' => $products,
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ],
        ]);
    }
}