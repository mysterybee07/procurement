<?php

namespace App\Http\Controllers;

use App\Http\Requests\EOIRequest;
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
            // new Middleware('permission:assign permissions to eois', only: ['assignPermissionsToRole']),
            // new Middleware('permission:update role permissions', only: ['updatePermissions']),
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

    public function publishEOI(Request $request, EOI $eoi)
    {
        $request->validate([
            'submission_deadline' => 'required|date|after:today',
        ]);

        // dd($request);
        // if ($eoi->status!=='approved') {
        //     return redirect()->back()
        //         ->with('error', 'EOI cannot be published because it has not been approved.');
        // }

        $eoi->update([
            'status' => 'published',
            'submission_deadline' => $request['submission_deadline'],
            'publish_date' => now(),
        ]);

        return redirect()->back()
            ->with('message', 'EOI published successfully.');
    }

    // to list vendor based on EOI
    public function listVendorSubmissionByEoi(Request $request, $eoiId)
    {
        $eoi = EOI::select('eoi_number')->where('id', $eoiId)->firstOrFail();
        
        if ($request->ajax() && $request->expectsJson()) {
            $submittedEois = DB::table('vendor_eoi_submissions as ves')
                ->leftJoin('vendors as v', 'ves.vendor_id', '=', 'v.id')
                ->leftJoin('users as u', 'v.user_id', '=', 'u.id')
                ->leftJoin('vendor_ratings as vr', 'ves.id', '=', 'vr.vendor_eoi_submission_id')
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

            // Filtering logic
            $orderColumn = 'ves.submission_date';
            if ($request->filled('rating_filter')) {
                switch ($request->rating_filter) {
                    case 'by_documents':
                        $submittedEois->where('vr.document_score', '>=', 3);
                        $orderColumn = 'vr.document_score';
                        break;
                    case 'by_submission_completeness':
                        $submittedEois->where('vr.submission_completeness_score', '>=', 3);
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
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ],
        ]);
    }
   
}