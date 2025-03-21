<?php

namespace App\Http\Controllers;

use App\Http\Requests\RequisitionRequest;
use App\Models\Requisition;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\RequestItem;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use function Termwind\render;

class RequisitionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // $requisitions = Requisition::with('requestItems');
        $requisitions = Requisition::with( 'requester', 'requestItems', 'requestItems.product')->paginate(10);
        // dd($requisitions);

        return Inertia::render('requisition/list-requisitions',[
            'requisitions'=>$requisitions,
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
        $products= Product::all();
        // dd($categories);
        return Inertia::render('requisition/requisition-form',[
            'products'=> $products,
            'flash'=>[
                'message'=>session('message'),
                'error'=>session('error'),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RequisitionRequest $request)
    {
        try {
            $requestData = $request->validated();
            $requester = auth()->user()->id;
    
            DB::beginTransaction();
    
            // Fetch all product names in a single query
            $productIds = array_column($requestData['requestItems'], 'product_id');
            $products = Product::whereIn('id', $productIds)->pluck('name', 'id');
    
            // Determine the title
            $title = $requestData['title'] ?? 'Required: ' . implode(', ', array_map(
                fn($item) => $products[$item['product_id']] ?? 'Unknown Product',
                $requestData['requestItems']
            ));
    
            $requisition = Requisition::create([
                'title' => $title,
                'required_date' => $requestData['required_date'],
                'requester' => $requester,
                'status' => $requestData['status'],
                'urgency' => $requestData['urgency'],
            ]);
    
            $requestItems = array_map(fn($item) => [
                'requisition_id' => $requisition->id,
                'required_quantity' => $item['required_quantity'],
                'additional_specifications' => $item['additional_specifications'],
                'product_id' => $item['product_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ], $requestData['requestItems']);
    
            // Bulk insert for efficiency
            RequestItem::insert($requestItems);
    
            DB::commit();
            return redirect()->back()->with('message', 'Requisition created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
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
        // $categories = ProductCategory::all();
        $requisition->load('requester');
        // dd($requisition);
       return Inertia::render('requisition/requisition-details',[
        'requisition'=>$requisition,
        // 'categories'=>$categories,
       ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Requisition $requisition)
    {
        // if ($requisition->status !== 'draft' || $requisition->status !== 'rejected') {
        //     return redirect()->route('requisitions.index')->with('error', 'Requisition has already been submitted. Now you cannot edit it');
        // }

        $products = Product::all();
        $requisition->load('requestItems');
        // dd($requisition->requestItems());
        
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

    // dd($request);
        try {
            $requester = auth()->user()->id;
            $requestData = $request->validated();
            
            DB::beginTransaction();

            $requisition = Requisition::create([
                'title'=>$requestData['title'],
                'description'=>$requestData['description'],
                'required_date'=>$requestData['required_date'],
                'requester'=>$requester,
                'status'=>$requestData['status'],
                'urgency'=>$requestData['urgency'],
                // 'eoi_id'=>$requestData['eoi_id'],
            ]);

            // Sync request items
            $requisition->requestItems()->delete();
            foreach ($requestData['requestItems'] as $item) {
                RequestItem::create([
                    'requisition_id' => $requisition->id,
                    'required_quantity' => $item['required_quantity'],
                    'additional_specifications' => $item['additional_specifications'],
                    'product_id' => $item['product_id'],
                ]);
            }

            DB::commit();
            return redirect()->route('requisitions.index')->with('message', 'Requisition updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'There was a problem updating the requisition. ' . $e->getMessage()]);
        }
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Requisition $requisition)
    {
        // if ($requisition->status !== 'draft' || $requisition->status !== 'rejected') {
        //     return redirect()->route('requisitions.index')->with(
        //         'error', 'Requisition has already been submitted. Now you cannot delete it'
        //     );
        // } 
        DB::beginTransaction();
        
        try{    
            // Delete requisition
            $requisition->delete();
            
            DB::commit();
            
            return redirect()->route('requisitions.index')
                ->with('message', 'Requisition deleted successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem deleting the requisition. ' . $e->getMessage()
            ]);
        }
    }
}
