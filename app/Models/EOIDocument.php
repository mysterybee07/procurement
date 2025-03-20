<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EOIDocument extends Model
{
    use HasFactory;

    protected $fillable=[
        'eoi_id',
        'document_id'
    ];

    public function eoi(){
        return $this->belongsTo(EOI::class, 'id');        
    }
    public function document(){
        return $this->belongsTo(Document::class, 'id');
    }
}
