<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductCategory extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'parent_category_id',
        'category_name',
        'category_code',
        'description'
    ];
    
    public function parentCategory()
    {
        return $this->belongsTo(ProductCategory::class, 'product_categories_id');
    }
    
    public function childCategories()
    {
        return $this->hasMany(ProductCategory::class, 'product_categories_id');
    }
    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}
