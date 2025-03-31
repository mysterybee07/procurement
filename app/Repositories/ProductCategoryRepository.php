<?php

namespace App\Repositories;

use App\Models\ProductCategory;
use App\Repositories\Interfaces\ProductCategoryInterface;
use Illuminate\Database\Eloquent\Collection;  // Ensure to use this import

class ProductCategoryRepository extends BaseRepository implements ProductCategoryInterface
{
    public function __construct(ProductCategory $model)
    {
        parent::__construct($model);
    }

    // To get parent categories
    public function getParentCategories(): Collection
    {
        return $this->model->whereNull('parent_category_id')->orderBy('category_name')->get();
    }

    public function hasChildren(ProductCategory $category): bool
    {
        return ProductCategory::where('parent_category_id', $category->id)->exists();
    }
}
