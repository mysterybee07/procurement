<?php

namespace App\Http\Controllers;

use App\Models\EOI;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Yajra\DataTables\DataTables;

class VendorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   

    public function EOIsForVendor()
    {
        $openedEOIs = EOI::whereIn('status', ['published', 'open', 'closed', 'cancelled', 'under_selection'])
        ->orderBy('submission_deadline', 'desc')
        ->paginate(10);
    
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

    // List all vendors
    public function ListAllVendors(Request $request)
    {
        if ($request->ajax() && $request->expectsJson()) {
            $vendors = DB::table('vendors as v')
                ->leftJoin('users as u', 'v.user_id', '=', 'u.id')
                ->select([
                    'v.id',
                    'v.vendor_name',
                    'v.registration_number',
                    'v.pan_number',
                    // 'v.in_contact_person',
                    'u.id as user_id', 
                    // 'u.name',
                    'u.email',
                    'u.phone',
                    // 'u.status'
                ]);

            return DataTables::of($vendors)
                ->addColumn('actions', function ($row) {
                    $actions = '<a href="' . route('vendor.show', $row->id) . '" class="text-indigo-600 hover:text-indigo-900 mr-2">View Details</a>';
                    // $actions .= '<a href="' . route('eois.edit', $row->id) . '" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</a>';
                    // $actions .= '<button data-id="' . $row->id . '" class="text-red-600 hover:text-red-900 delete-vendor">Delete</button>';
                    
                    return $actions;
                })
                ->filterColumn('vendor_name', function($query, $keyword) {
                    $query->where('v.vendor_name', 'like', "%{$keyword}%");
                })
                ->filterColumn('registration_number', function($query, $keyword) {
                    $query->where('v.registration_number', 'like', "%{$keyword}%");
                })
                ->filterColumn('pan_number', function($query, $keyword) {
                    $query->where('v.pan_number', 'like', "%{$keyword}%");
                })
                // ->filterColumn('name', function($query, $keyword) {
                //     $query->where('u.name', 'like', "%{$keyword}%");
                // })
                ->filterColumn('email', function($query, $keyword) {
                    $query->where('u.email', 'like', "%{$keyword}%");
                })
                ->rawColumns(['actions'])
                ->toJson();

                // dump($vendors);
        }


        return Inertia::render('vendor/admin-side/list-vendor', [
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }
}
