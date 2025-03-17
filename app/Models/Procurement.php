<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Procurement extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'title',
        'description',
        'required_date',
        'requester',
        'status',
        'urgency',
        'eoi_id',
    ];
    
    // Relationship with EOI
    public function eoi()
    {
        return $this->belongsTo(EOI::class, 'eoi_id');
    }
    
    // Relationship with request items
    public function requestItems()
    {
        return $this->hasMany(RequestItem::class, 'procurement_id');
    }
}
