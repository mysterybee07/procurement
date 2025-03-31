<?php

namespace App\Services;

use App\Models\ProductCategory;
use App\Repositories\Interfaces\ProductCategoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ProductCategoryService
{
    protected ProductCategoryInterface $categoryRepository;

    public function __construct(ProductCategoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function getAllCategories(int $perPage = 10): LengthAwarePaginator
    {
        return $this->categoryRepository->getAllPaginated($perPage);
    }

    public function getParentCategories(): Collection
    {
        return $this->categoryRepository->getParentCategories();
    }

    public function createCategory(array $data): ProductCategory
    {
        return $this->categoryRepository->create($data);
    }

    public function updateCategory(ProductCategory $category, array $data): bool
    {
        return $this->categoryRepository->update($category, $data);
    }

    public function deleteCategory(ProductCategory $category): array
    {
        if ($this->categoryRepository->hasChildren($category)) {
            return ['success' => false, 'message' => 'Cannot delete category with subcategories. Please delete subcategories first.'];
        }

        try {
            DB::beginTransaction();

            $this->categoryRepository->delete($category);

            DB::commit();
            return ['success' => true, 'message' => 'Category deleted successfully.'];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['success' => false, 'message' => 'An error occurred while deleting the category. Please try again.'];
        }
    }
}
