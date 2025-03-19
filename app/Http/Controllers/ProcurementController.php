<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProcurementRequest;
use App\Models\Procurement;
use App\Models\ProductCategory;
use App\Models\RequestItem;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use function Termwind\render;

class ProcurementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // $procurements = Procurement::with('requestItems');
        $procurements = Procurement::with('requestItems', 'requestItems.category', 'requester')->paginate(10);
        // dd($procurements);

        return Inertia::render('procurement/list-procurements',[
            'procurements'=>$procurements,
            'flash'=>[
                'message'=>session('message'),
                'error'=>session('error'),
            ]
        ]);
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
            'flash'=>[
                'message'=>session('message'),
                'error'=>session('error'),
            ]
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
            DB::commit();
            return redirect()->route('procurements.index')->with('message', 'procurement created successfully');
        }catch(\Exception $e){
            DB::rollBack();
            return back()->withErrors([
                'error' => 'There was a problem creating the role. ' . $e->getMessage()
            ]);

        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Procurement $procurement)
    {
        // $categories = ProductCategory::all();
        $procurement->load('requestItems', 'requestItems.category', 'requester');
        dd($procurement);
       return Inertia::render('procurement/procurement-details',[
        'procurement'=>$procurement,
        // 'categories'=>$categories,
       ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Procurement $procurement)
    {
        // if ($procurement->status !== 'draft' || $procurement->status !== 'rejected') {
        //     return redirect()->route('procurements.index')->with('error', 'Procurement has already been submitted. Now you cannot edit it');
        // }

        $categories = ProductCategory::all();
        $procurement->load('requestItems');
        // dd($procurement->requestItems());
        
        return Inertia::render('procurement/procurement-form', [
            'procurement' => $procurement,
            'categories' => $categories,
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
    public function update(ProcurementRequest $request, Procurement $procurement)
    {

    // dd($request);
        try {
            $requester = auth()->user()->id;
            $requestData = $request->validated();
            
            DB::beginTransaction();

            $procurement->update([
                'title' => $requestData['title'],
                'description' => $requestData['description'],
                'required_date' => $requestData['required_date'],
                'requester'=>$requester,
                'status' => $requestData['status'],
                'urgency' => $requestData['urgency'],
            ]);

            // Sync request items
            $procurement->requestItems()->delete();
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

            DB::commit();
            return redirect()->route('procurements.index')->with('message', 'Procurement updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'There was a problem updating the procurement. ' . $e->getMessage()]);
        }
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Procurement $procurement)
    {
        if ($procurement->status !== 'draft' || $procurement->status !== 'rejected') {
            return redirect()->route('procurements.index')->with(
                'error', 'Procurement has already been submitted. Now you cannot delete it'
            );
        } 
        DB::beginTransaction();
        
        try{    
            // Delete procurement
            $procurement->delete();
            
            DB::commit();
            
            return redirect()->route('procurements.index')
                ->with('message', 'Procurement deleted successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem deleting the procurement. ' . $e->getMessage()
            ]);
        }
    }
}
