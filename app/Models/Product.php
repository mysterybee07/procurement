<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'category_id',
        'in_stock_quantity',
        'unit',
        'specifications',
    ];
    
    // procurement relationship
    public function procurement()
    {
        return $this->belongsTo(Procurement::class, 'procurement_id');
    }
    
    // category relationship
    public function category()
    {
        return $this->hasMany(ProductCategory::class, 'id');
    }
}
