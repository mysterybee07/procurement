<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestItem extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'procurement_id',
        'name',
        'quantity',
        'unit',
        'estimated_unit_price',
        'core_specifications',
        'category_id',
    ];
    
    // procurement relationship
    public function procurement()
    {
        return $this->belongsTo(Procurement::class, 'procurement_id');
    }
    
    // category relationship
    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }
}
