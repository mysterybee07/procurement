<?php
namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Collection;
use App\Models\ProductCategory;

interface ProductCategoryInterface extends BaseInterface
{
    public function getParentCategories(): Collection;
    public function hasChildren(ProductCategory $category): bool;
}
