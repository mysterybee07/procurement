<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EOIRequisition extends Model
{
    use HasFactory;

    protected $fillable=[
        'eoi_id',
        'requisition_id'
    ];

    public function eoi(){
        return $this->belongsTo(EOI::class, 'id');        
    }
    public function requisition(){
        return $this->belongsTo(Procurement::class, 'id');
    }
}
