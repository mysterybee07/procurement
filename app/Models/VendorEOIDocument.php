<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VendorEOIDocument extends Model
{
    protected $table= 'vendor_eoi_documents';
    protected $fillable = [
        'eoi_submission_id', 
        'document_id', 
        'file_path', 
        'vendor_id'
        // 'original_filename'
    ];

    public function vendorEOISubmission()
    {
        return $this->belongsTo(VendorEOISubmission::class);
    }

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }
}
