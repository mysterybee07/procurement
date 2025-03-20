<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\EOI;
use App\Models\Procurement;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EOIController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('eoi/list-eois');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $procurements = [];
        $products = Product::all();
        $requiredDocuments = Document::all();

        if ($request->has('procurement_ids') && !empty($request->procurement_ids)) {
            $procurementIds = $request->procurement_ids;
            $procurements = Procurement::whereIn('id', $procurementIds)->get();
        }

        return Inertia::render('eoi/eoi-form', [
            'products'=>$products,
            'procurements' => $procurements,
            'requiredDocuments'=>$requiredDocuments
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $created_by = auth()->user()->id;
            $requestData = $request->validated();
            
            DB::beginTransaction();

            $eoi = EOI::create([
                'title'=>$requestData['title'],
                'description'=>$requestData['description'],
                'required_date'=>$requestData['required_date'],
                'created_by'=>$created_by,
                'status'=>$requestData['status'],
                'urgency'=>$requestData['urgency'],
                // 'eoi_id'=>$requestData['eoi_id'],
            ]);
            DB::commit();
            return redirect()->route('procurements.index')->with('message', 'Procurement updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'There was a problem updating the procurement. ' . $e->getMessage()]);
        }
        
    }

    /**
     * Display the specified resource.
     */
    public function show(EOI $eOI)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EOI $eOI)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EOI $eOI)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EOI $eOI)
    {
        //
    }
}
