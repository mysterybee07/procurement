<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Requisition extends Model
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
        return $this->hasMany(EOI::class, 'eoi_id');
    }
    
    // Relationship with request items
    public function requestItems()
    {
        return $this->hasMany(RequestItem::class, 'requisition_id');
    }

    public function requester(){
        return $this->belongsTo(User::class, 'requester');
    }

    // public function documents(){
    //     return $this-> hasMany(Document::class, 'document_id');
    // }
}
