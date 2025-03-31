<?php

namespace App\Http\Controllers;

use App\Http\Requests\RequisitionRequest;
use App\Models\Requisition;
use App\Models\Product;
use App\Services\RequisitionService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

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
    public function index()
    {
        $requisitions = $this->requisitionService->getAllPaginated();

        return Inertia::render('requisition/list-requisitions', [
            'requisitions' => $requisitions,
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