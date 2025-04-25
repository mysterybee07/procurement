<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\ProductCategory;
use App\Services\ProductCategoryService;
use Barryvdh\Debugbar\Facades\Debugbar;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Yajra\DataTables\DataTables;

class ProductCategoryController extends Controller implements HasMiddleware
{
    protected ProductCategoryService $categoryService;

    public function __construct(ProductCategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public static function middleware(): array
    {
        return [
            new Middleware('permission:view categories', only: ['index']),
            new Middleware('permission:create categories', only: ['create', 'store']),
            new Middleware('permission:edit categories', only: ['edit', 'update']),
            new Middleware('permission:delete categories', only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        // Debugbar::info($request);
        if ($request->ajax() && $request->expectsJson()) {
            $categories = DB::table('product_categories as c')
                ->leftJoin('product_categories as p', 'c.parent_category_id', '=', 'p.id')
                ->select([
                    'c.id',
                    'c.category_name',
                    'c.category_code',
                    'c.description',
                    'p.category_name as parent_category_name',
                ]);

            return DataTables::of($categories)
                ->filterColumn('category_name', function($query, $keyword) {
                    $query->where('c.category_name', 'like', "%{$keyword}%");
                })
                ->filterColumn('category_code', function($query, $keyword) {
                    $query->where('c.category_code', 'like', "%{$keyword}%");
                })
                ->filterColumn('parent_category_name', function($query, $keyword) {
                    $query->where('p.category_name', 'like', "%{$keyword}%");
                })
                ->filterColumn('description', function($query, $keyword) {
                    $query->where('c.description', 'like', "%{$keyword}%");
                })
                ->addColumn('actions', function ($row) {
                    return '<a href="/categories/'.$row->id.'/edit" class="text-indigo-600 hover:underline mr-2">Edit</a>' .
                        '<a href="#" data-id="'.$row->id.'" class="text-red-600 hover:underline delete-category">Delete</a>';
                })
                ->rawColumns(['actions'])
                ->toJson();
        }

        return Inertia::render('product-category/list-product-category', [
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }


    public function create()
    {
        $parentCategories = $this->categoryService->getParentCategories();
        // Debugbar::info($parentCategories);
        return Inertia::render('product-category/product-category-form', [
            'parentCategories' => $parentCategories
        ]);
    }

    public function store(CategoryRequest $request)
    {
        $this->categoryService->createCategory($request->validated());

        return redirect()->route('categories.index')
        ->with('message', 'Product Category created successfully');
    }

    public function edit(ProductCategory $category)
    {
        $parentCategories = $this->categoryService->getParentCategories();
        // dd($parentCategories);

        return Inertia::render('product-category/product-category-form', [
            'category' => $category,
            'parentCategories' => $parentCategories
            ->where('id', '!=', $category->id),
            'isEditing' => true,
        ]);
    }

    public function update(CategoryRequest $request, ProductCategory $category)
    {
        $this->categoryService->updateCategory($category, $request->validated());

        return redirect()->route('categories.index')->with('message', 'Category updated successfully.');
    }

    public function destroy(ProductCategory $category)
    {
        $result = $this->categoryService->deleteCategory($category);

        return back()->with($result['success'] ? 'message' : 'error', $result['message']);
    }
}
