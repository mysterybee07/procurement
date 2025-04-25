<?php

namespace App\Repositories\Interfaces;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

interface ProductInterface extends BaseInterface
{
    public function getAllCategories(): Collection;
}
