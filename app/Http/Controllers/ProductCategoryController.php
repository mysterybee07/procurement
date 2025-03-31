<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\ProductCategory;
use App\Services\ProductCategoryService;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

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

    public function index()
    {
        $categories = $this->categoryService->getAllCategories();

        return Inertia::render('product-category/list-product-category', [
            'categories' => $categories,
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        $parentCategories = $this->categoryService->getParentCategories();

        return Inertia::render('product-category/product-category-form', [
            'parentCategories' => $parentCategories
        ]);
    }

    public function store(CategoryRequest $request)
    {
        $this->categoryService->createCategory($request->validated());

        return redirect()->route('categories.index')->with('message', 'Product Category created successfully');
    }

    public function edit(ProductCategory $category)
    {
        $parentCategories = $this->categoryService->getParentCategories();

        return Inertia::render('product-category/product-category-form', [
            'category' => $category,
            'parentCategories' => $parentCategories->where('id', '!=', $category->id),
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
