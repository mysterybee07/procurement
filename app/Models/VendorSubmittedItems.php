<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VendorSubmittedItems extends Model
{
    protected $fillable = [
        'vendor_eoi_submission_id',
        'request_items_id',
        // 'product_name',
        // 'required_quantity',
        'actual_unit_price',
        'actual_product_total_price',
        'discount_rate',
        // 'can_provide'
    ];

    public function vendorEOISubmission()
    {
        return $this->belongsTo(VendorEOISubmission::class);
    }

    public function requestItem()
    {
        return $this->belongsTo(RequestItem::class);
    }
}
