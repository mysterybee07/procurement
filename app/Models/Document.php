<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;
    protected $table = 'documents';
    protected $fillable = [
        'name',
    ];

    public function eois()
    {
        return $this->belongsToMany(EOI::class, 'eoi_documents', 'document_id', 'eoi_id');
    }
}
