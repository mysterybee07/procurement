<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProcurementRequest;
use App\Models\Procurement;
use App\Models\ProductCategory;
use App\Models\RequestItem;
use DB;
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
        $categories= ProductCategory::all();
        // dd($categories);
        return Inertia::render('procurement/procurement-form',[
            'categories'=> $categories,
            'isEditing'=>false,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProcurementRequest $request)
    {

        try{
            // dd($request);
            $requestData = $request->validated();
            // dd($requestData);

            // dd($requestData->json());
            $requester = auth()->user()->id;
            // dd($requester);
                DB::beginTransaction();

            $procurement = Procurement::create([
                'title'=>$requestData['title'],
                'description'=>$requestData['description'],
                'required_date'=>$requestData['required_date'],
                'requester'=>$requester,
                'status'=>$requestData['status'],
                'urgency'=>$requestData['urgency'],
                // 'eoi_id'=>$requestData['eoi_id'],
            ]);

            foreach ($requestData['requestItems'] as $item) {
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
        }catch(\Exception){

        }finally{

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
