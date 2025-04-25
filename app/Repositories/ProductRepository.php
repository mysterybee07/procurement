<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Repositories\Interfaces\ProductInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductRepository extends BaseRepository implements ProductInterface
{
    public function __construct(Product $model)
    {
        parent::__construct($model);
    }

    public function getAllPaginated(int $perPage = 10, array $relations = []): LengthAwarePaginator
    {
        return parent::getAllPaginated($perPage, ['category']);
    }
    
    public function getAllCategories(): Collection
    {
        return ProductCategory::orderBy('category_name')->get();
    }
}
