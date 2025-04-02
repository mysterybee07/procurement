<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'eoi_submission_id',
        'vendor_id',
        'eoi_id',
        'total_pricing_score',
        'delivery_date_score',
        'submission_completeness_score',
        'document_score',
        'past_performance_score',
        'overall_rating',
    ];

    /**
     * Get the vendor associated with the rating
     */
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Get the EOI associated with the rating
     */
    public function eoi()
    {
        return $this->belongsTo(Eoi::class);
    }

    /**
     * Get the submission associated with the rating
     */
    public function submission()
    {
        return $this->belongsTo(VendorEoiSubmission::class, 'vendor_eoi_submission_id');
    }

}
