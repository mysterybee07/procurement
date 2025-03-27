<?php

namespace App\Http\Controllers;

use App\Models\EOI;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VendorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   

    public function EOIsForVendor()
    {
        $openedEOIs = EOI::where('status', 'published')->paginate(10); 

        // Fetch distinct product categories using a join
        $categories = DB::table('eois')
            ->join('requisitions', 'requisitions.eoi_id', '=', 'eois.id')
            ->join('request_items', 'request_items.requisition_id', '=', 'requisitions.id')
            ->join('products', 'products.id', '=', 'request_items.product_id')
            ->join('product_categories', 'product_categories.id', '=', 'products.category_id')
            ->where('eois.status', 'published')
            ->distinct()
            ->pluck('product_categories.category_name');
        // dd($categories);
        return Inertia::render('vendor/vendor-side/open-eois-for-vendor', [
            'eois' => $openedEOIs,
            'categories' => $categories,
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
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
