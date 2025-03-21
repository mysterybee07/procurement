<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestItem extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'procurement_id',
        'product_id',
        'required_quantity',
        'additional_specifications',
    ];
    
    // procurement relationship
    public function procurement()
    {
        return $this->belongsTo(Procurement::class, 'procurement_id');
    }
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
