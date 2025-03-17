<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProcurementRequest;
use App\Models\Procurement;
use App\Models\RequestItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProcurementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('procurement/list-procurements');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('procurement/procurement-form');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProcurementRequest $request)
    {
        $requestData = $request->validated();

        // dd($requestData);

        $procurement = Procurement::create([
            'title'=>$requestData['title'],
            'description'=>$requestData['description'],
            'request_date'=>$requestData['request_date'],
            'requester'=>$requestData['requester'],
            'status'=>$requestData['status'],
            'urgency'=>$requestData['urgency'],
            'eoi_id'=>$requestData['eoi_id'],
        ]);

        foreach ($requestData['request_items'] as $item) {
            RequestItem::create([
                'procurement_id' => $procurement->id,
                'name' => $item['name'],
                'quantity' => $item['quantity'],
                'unit' => $item['unit'],
                'estimated_unit_price' => $item['estimated_unit_price'],
                'core_specifications' => $item['core_specifications'],
                'category_id' => $item['category_id'],
            ]);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show(Procurement $requisition)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Procurement $requisition)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Procurement $requisition)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Procurement $requisition)
    {
        //
    }
}
