<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ProductController extends Controller implements HasMiddleware
{
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public static function middleware(): array
    {
        return [
            new Middleware('permission:view products', only: ['index']),
            new Middleware('permission:create products', only: ['create', 'store']),
            new Middleware('permission:edit products', only: ['edit', 'update']),
            new Middleware('permission:delete products', only: ['destroy']),
        ];
    }

    public function index()
    {
        $products = $this->productService->getAllProducts();
        // dd($products);

        return Inertia::render('product/list-products', [
            'products' => $products,
            'flash' => [
                'message' => session('message'),
                'error' => session('error')
            ]
        ]);
    }

    public function create()
    {
        $categories = $this->productService->getAllCategories();

        return Inertia::render('product/product-form', [
            'categories' => $categories,
        ]);
    }

    public function store(ProductRequest $request)
    {
        $result = $this->productService->createProduct($request->validated());

        return $result['success']
            ? redirect()->route('products.index')->with('message', $result['message'])
            : back()->withErrors(['error' => $result['message']]);
    }

    public function edit(Product $product)
    {
        $categories = $this->productService->getAllCategories();

        return Inertia::render('product/product-form', [
            'categories' => $categories,
            'product' => $product,
            'isEditing' => true,
        ]);
    }

    public function update(ProductRequest $request, Product $product)
    {
        $result = $this->productService->updateProduct($product, $request->validated());

        return $result['success']
            ? redirect()->route('products.index')->with('message', $result['message'])
            : back()->withErrors(['error' => $result['message']]);
    }

    public function destroy(Product $product)
    {
        $result = $this->productService->deleteProduct($product);

        return $result['success']
            ? back()->with('message', $result['message'])
            : back()->withErrors(['error' => $result['message']]);
    }
}
