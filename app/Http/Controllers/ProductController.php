<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Yajra\DataTables\DataTables;

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

    public function index(Request $request)
    {
        if ($request->ajax() && $request->expectsJson()) {
            $products = DB::table('products as p')
                ->leftJoin('product_categories as c', 'p.category_id', '=', 'c.id')
                ->select([
                    'p.id',
                    'p.name',
                    'p.in_stock_quantity',
                    'p.unit',
                    'p.specifications',
                    DB::raw('GROUP_CONCAT(c.category_name SEPARATOR ", ") as categories')
                ])
                ->groupBy('p.id', 'p.name', 'p.in_stock_quantity', 'p.unit', 'p.specifications');

            return DataTables::of($products)
                ->filterColumn('name', function($query, $keyword) {
                    $query->where('p.name', 'like', "%{$keyword}%");
                })
                ->filterColumn('categories', function($query, $keyword) {
                    $query->where('c.category_name', 'like', "%{$keyword}%");
                })
                ->filterColumn('specifications', function($query, $keyword) {
                    $query->where('p.specifications', 'like', "%{$keyword}%");
                })
                ->addColumn('actions', function ($row) {
                    return '<a href="'.route('products.edit', $row->id).'" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</a>' .
                        '<button data-id="'.$row->id.'" class="text-red-600 hover:text-red-900 delete-product">Delete</button>';
                })
                ->editColumn('specifications', function ($row) {
                    return strlen($row->specifications) > 50 ? 
                        substr($row->specifications, 0, 50) . '...' : 
                        $row->specifications ?? 'N/A';
                })
                ->rawColumns(['actions'])
                ->toJson();
        }

        return Inertia::render('product/list-products', [
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
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
