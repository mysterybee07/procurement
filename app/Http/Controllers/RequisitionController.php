<?php

namespace App\Http\Controllers;

use App\Http\Requests\RequisitionRequest;
use App\Models\Requisition;
use App\Models\Product;
use App\Services\RequisitionService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Yajra\DataTables\DataTables;

class RequisitionController extends Controller implements HasMiddleware
{
    protected $requisitionService;

    public function __construct(RequisitionService $requisitionService)
    {
        $this->requisitionService = $requisitionService;
    }

    /**
     * Define middleware for the controller
     */
    public static function middleware(): array
    {
        return [
            new Middleware('permission:view requisitions', only: ['index']),
            new Middleware('permission:create requisitions', only: ['create']),
            new Middleware('permission:edit requisitions', only: ['edit']),
            new Middleware('permission:delete requisitions', only: ['destroy']),
            new Middleware('permission:fulfill requisitionItem', only: ['fulfillRequisitionItem']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->ajax() && $request->expectsJson()) {
            $requisitions = DB::table('requisitions as r')
                ->leftJoin('users as u', 'r.requester', '=', 'u.id')
                ->select([
                    'r.id',
                    'r.title',
                    // 'r.description',
                    'r.required_date',
                    'r.status',
                    'r.urgency',
                    'r.eoi_id',
                    'u.id as requester_id',
                    'u.name as requester'
                ]);

            return DataTables::of($requisitions)
                ->addColumn('products', function ($row) {
                    $items = DB::table('request_items as ri')
                        ->join('products as p', 'ri.product_id', '=', 'p.id')
                        ->where('ri.requisition_id', $row->id)
                        ->where('ri.required_quantity', '>', 0)
                        ->pluck('p.name')
                        ->toArray();
                    
                    return !empty($items) ? implode(', ', $items) : 'N/A';
                })
                ->addColumn('quantities', function ($row) {
                    $quantities = DB::table('request_items')
                        ->where('requisition_id', $row->id)
                        ->where('required_quantity', '>', 0)
                        ->pluck('required_quantity')
                        ->toArray();
                    
                    return !empty($quantities) ? implode(', ', $quantities) : 'N/A';
                })
                ->addColumn('in_stock', function ($row) {
                    $inStock = DB::table('request_items as ri')
                        ->join('products as p', 'ri.product_id', '=', 'p.id')
                        ->where('ri.requisition_id', $row->id)
                        ->where('ri.required_quantity', '>', 0)
                        ->pluck('p.in_stock_quantity')
                        ->toArray();
                    
                    return !empty($inStock) ? implode(', ', $inStock) : 'N/A';
                })
                ->addColumn('select', function ($row) {
                    return $row->id;
                })
                ->addColumn('actions', function ($row) {
                    $actions = '<a href="' . route('requisitions.show', $row->id) . '" class="text-indigo-600 hover:text-indigo-900 mr-2">View</a>';
                    
                    // Check if user can edit (will be handled by frontend based on user permissions)
                    if (auth()->id() == $row->requester && $row->status == 'draft') {
                        $actions .= '<a href="' . route('requisitions.edit', $row->id) . '" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</a>';
                        $actions .= '<button data-submit-id="' . $row->id . '" class="text-indigo-600 hover:text-indigo-900 mr-2 submit-requisition">Submit</button>';
                    }
                    
                    // Add delete button
                    $actions .= '<button data-id="' . $row->id . '" class="text-red-600 hover:text-red-900 delete-requisition">Delete</button>';
                    
                    return $actions;
                })
                ->filterColumn('requester', function($query, $keyword) {
                    $query->where('u.name', 'like', "%{$keyword}%");
                })
                ->filterColumn('title', function($query, $keyword) {
                    $query->where('r.title', 'like', "%{$keyword}%");
                })
                ->filterColumn('status', function($query, $keyword) {
                    $query->where('r.status', 'like', "%{$keyword}%");
                })
                ->rawColumns(['actions'])
                ->toJson();
        }

        return Inertia::render('requisition/list-requisitions', [
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $products = Product::all();
        
        return Inertia::render('requisition/requisition-form', [
            'products' => $products,
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RequisitionRequest $request)
    {
        try {
            $this->requisitionService->create($request->validated());
            return redirect()->route('requisitions.index')->with('message', 'Requisition created successfully');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'There was a problem creating the requisition. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Requisition $requisition)
    {
        $requisition = $this->requisitionService->getById($requisition->id);
        
        return Inertia::render('requisition/requisition-details', [
            'requisition' => $requisition,
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Requisition $requisition)
    {
        if (!$this->requisitionService->canEditRequisition($requisition)) {
            return redirect()->route('requisitions.index')->with('error', 'Requisition has already been submitted. Now you cannot edit it');
        }

        $products = Product::all();
        $requisition->load('requestItems');
        
        return Inertia::render('requisition/requisition-form', [
            'requisition' => $requisition,
            'products' => $products,
            'isEditing' => true,
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RequisitionRequest $request, Requisition $requisition)
    {
        try {
            $this->requisitionService->update($requisition, $request->validated());
            return redirect()->route('requisitions.index')->with('message', 'Requisition updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'There was a problem updating the requisition. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Requisition $requisition)
    {
        try {    
            $this->requisitionService->delete($requisition);
            return redirect()->route('requisitions.index')
                ->with('message', 'Requisition deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'There was a problem deleting the requisition. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Submit a requisition
     */
    public function submitRequisition(Requisition $requisition)
    {
        try {
            $this->requisitionService->submitRequisition($requisition);
            return redirect()->back()
                ->with('message', 'Requisition submitted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'There was a problem submitting the requisition. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Fulfill a requisition item
     */
    public function fulfillRequisitionItem(Request $request, $id)
    {
        $request->validate([
            'provided_quantity' => 'required|numeric|min:1',
        ]);

        try {
            $result = $this->requisitionService->fulfillRequisitionItem($id, $request->provided_quantity);
            
            if (!$result['success']) {
                return redirect()->back()->withErrors(['provided_quantity' => $result['message']]);
            }
            
            return redirect()->back()->with('message', $result['message']);
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'There was a problem fulfilling the requisition. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Receive a requisition item
     */
    public function receiveRequisitionItem($id)
    {
        try {
            $this->requisitionService->receiveRequisitionItem($id);
            return redirect()->back()->with('message', 'Requisition item received successfully.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'There was a problem receiving the requisition item. ' . $e->getMessage()
            ]);
        }
    }
}