<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\Interfaces\ProductInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use DB;

class ProductService
{
    protected ProductInterface $productRepository;

    public function __construct(ProductInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public function getAllProducts(int $perPage = 10): LengthAwarePaginator
    {
        return $this->productRepository->getAllPaginated($perPage);
    }

    public function getAllCategories(): Collection
    {
        return $this->productRepository->getAllCategories();
    }

    public function createProduct(array $data): array
    {
        try {
            DB::beginTransaction();
            $product = $this->productRepository->create($data);
            DB::commit();
            return ['success' => true, 'message' => 'Product created successfully', 'product' => $product];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['success' => false, 'message' => 'There was a problem creating the product. ' . $e->getMessage()];
        }
    }

    public function updateProduct(Product $product, array $data): array
    {
        try {
            $this->productRepository->update($product, $data);
            return ['success' => true, 'message' => 'Product updated successfully'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Error updating product: ' . $e->getMessage()];
        }
    }

    public function deleteProduct(Product $product): array
    {
        try {
            $this->productRepository->delete($product);
            return ['success' => true, 'message' => 'Product deleted successfully'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Error deleting product: ' . $e->getMessage()];
        }
    }
}
