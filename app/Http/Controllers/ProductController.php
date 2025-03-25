<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use DB;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ProductController extends Controller implements HasMiddleware
{
    /**
     * Display a listing of the resource.
     */

     public static function middleware(): array
    {
        return [
            new Middleware('permission:view products', only: ['index']),
            new Middleware('permission:create products', only: ['create']),
            new Middleware('permission:edit products', only: ['edit']),
            new Middleware('permission:delete products', only: ['destroy']),
            // new Middleware('permission:assign permissions to eois', only: ['assignPermissionsToRole']),
            // new Middleware('permission:update role permissions', only: ['updatePermissions']),
        ];
    }
    public function index()
    {
        $products = Product::with('category')->paginate();

        return Inertia::render('product/list-products',[
            'products'=>$products,
            'flash'=>[
                'message'=>session('message'),
                'error'=>session('error')
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = ProductCategory::all();
        return Inertia::render('product/product-form',[
            'categories'=>$categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request)
    {

        // dd($requestData);
        try {
            DB::beginTransaction();
        
            $requestData = $request->validated(); 
        
            Product::create($requestData);
        
            DB::commit(); 
            return redirect()->route('products.index')->with('message', 'Product created successfully');
        
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'There was a problem creating the product. ' . $e->getMessage()
            ]);
        }
        
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $categories= ProductCategory::all();
        return Inertia::render('product/product-form',[
            'categories'=>$categories,
            'product'=>$product,
            'isEditing'=>true,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        //
    }
}
