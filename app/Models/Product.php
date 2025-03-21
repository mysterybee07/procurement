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
    // public function procurement()
    // {
    //     return $this->belongsTo(Procurement::class, 'procurement_id');
    // }
    
    // category relationship
    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function requestItem(){
        return $this->belongsTo(RequestItem::class,'product_id');
    }
}
