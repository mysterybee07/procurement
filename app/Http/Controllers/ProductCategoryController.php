<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class ProductCategoryController extends Controller implements HasMiddleware
{
    /**
     * Display a listing of the resource.
     */

    public static function middleware(): array
    {
        return [
            new Middleware('permission:view categories', only: ['index']),
            new Middleware('permission:create categories', only: ['create']),
            new Middleware('permission:edit categories', only: ['edit']),
            new Middleware('permission:delete categories', only: ['destroy']),
            // new Middleware('permission:assign permissions to eois', only: ['assignPermissionsToRole']),
            // new Middleware('permission:update role permissions', only: ['updatePermissions']),
        ];
    }
    public function index()
    {
        $categories = ProductCategory::with('parentCategory')
            ->orderBy('category_name')
            ->paginate(10);
            // dd($categories);
            
        // $parentCategories = ProductCategory::select('id', 'category_name')
        //     ->orderBy('category_name')
        //     ->get();

        return Inertia::render('product-category/list-product-category', [
            'categories' => $categories,
            'flash' => [
            'message' => session('message'),
            'error' => session('error'),
            ]
            // 'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $parentCategories = ProductCategory::select('id', 'category_name')
        ->orderBy('category_name')
        ->get();
        return Inertia::render('product-category/product-category-form',[
            'parentCategories'=> $parentCategories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryRequest $request)
    {
        // dd($request->json());
        ProductCategory::create($request->validated());
        return redirect()->route('categories.index')->with('message', 'Product Category created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductCategory $productCategory)
    {
        
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductCategory $category)
    {
        $parentCategories = ProductCategory::select('id', 'category_name')
            ->where('id', '!=', $category->id)
            ->orderBy('category_name')
            ->get();

        return Inertia::render('product-category/product-category-form', [
            'category' => $category,
            'parentCategories' => $parentCategories,
            'isEditing' => true,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CategoryRequest $request, ProductCategory $category)
    {
        $category->update($request->validated());

        return redirect()->route('categories.index')->with('message', 'Category updated successfully.');
    }   

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductCategory $category)
    {
        // Check if this category has children
        $hasChildren = ProductCategory::where('parent_category_id', $category->id)->exists();
        
        if ($hasChildren) {
            return back()->with('error', 'Cannot delete category with subcategories. Please delete subcategories first.');
        }
        
        $category->delete();
        
        return back()->with('message', 'Category deleted successfully.');
    }
}
