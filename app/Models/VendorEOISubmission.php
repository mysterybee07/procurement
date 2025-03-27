<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VendorEOISubmission extends Model
{
    protected $table='vendor_eoi_submissions';

    protected $fillable = [
        'eoi_id',
        'vendor_id',
        'submission_date',
        'status',
        'terms_and_conditions',
        'delivery_date',
        'remarks',
        'items_total_price'
    ];

    protected $dates = [
        'submission_date',
        'delivery_date'
    ];

    public function eoi()
    {
        return $this->belongsTo(EOI::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function vendorSubmittedItems()
    {
        return $this->hasMany(VendorSubmittedItems::class);
    }
}
