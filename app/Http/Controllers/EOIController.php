<?php

namespace App\Http\Controllers;

use App\Http\Requests\EOIRequest;
use App\Models\Document;
use App\Models\EOI;
use App\Models\Product;
use App\Models\Requisition;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
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
    public function index()
    {
        $eois = EOI::with('createdBy', 'requisitions.requestItems.product')->paginate();
        // dd($eois);

        return Inertia::render('eoi/list-eois', [
            'eois' => $eois,
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
    // Load required relationships
    $eoi->load('createdBy', 'documents', 'requisitions.requestItems.product.category');

    // Aggregate request items by product ID
    $aggregatedItems = [];

    foreach ($eoi->requisitions as $requisition) {
        foreach ($requisition->requestItems as $item) {
            $productId = $item->product->id;

            if (!isset($aggregatedItems[$productId])) {
                $aggregatedItems[$productId] = [
                    'name' => $item->product->name,
                    'unit' => $item->product->unit,
                    'category' => $item->product->category->category_name,
                    'required_quantity' => 0, 
                ];
            }

            // Add the quantity
            $aggregatedItems[$productId]['required_quantity'] += $item->required_quantity;
        }
    }

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
            'submission_deadline' => $requestData['submission_deadline'],
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
        // First, remove EOI reference from requisitions
        Requisition::where('eoi_id', $eoi->id)
            ->update(['eoi_id' => null]);
            
        // Detach all documents
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
        // if (!$eoi->isApproved) {
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
}