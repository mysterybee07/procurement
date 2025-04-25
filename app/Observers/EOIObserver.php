<?php

namespace App\Observers;

use App\Models\EOI;
use App\Services\VendorRatingService;
use Carbon\Carbon;

class EOIObserver
{

    protected $vendorRatingService;

    public function __construct(VendorRatingService $vendorRatingService)
    {
        $this->vendorRatingService = $vendorRatingService;
    }

    /**
     * Handle the EOI "created" event.
     */
    public function created(EOI $eoi): void
    {
        //
    }

    /**
     * Handle the EOI "updated" event.
     */
    public function updated(EOI $eoi): void
    {
        if ($eoi->status === "under_selection") {
            $this->vendorRatingService->updateVendorRatingsForEoi($eoi->id);
        }
    }

    /**
     * Handle the EOI "deleted" event.
     */
    public function deleted(EOI $eoi): void
    {
        //
    }

    /**
     * Handle the EOI "restored" event.
     */
    public function restored(EOI $eoi): void
    {
        //
    }

    /**
     * Handle the EOI "force deleted" event.
     */
    public function forceDeleted(EOI $eoi): void
    {
        //
    }

    public function retrieved(EOI $eoi): void
    {
        if ($eoi->status === 'open' && 
            $eoi->submission_deadline !== null && 
            Carbon::parse($eoi->submission_deadline)->startOfDay()->isPast()) {
            
            $eoi->status = 'closed';
            
            // prevent infinite loop by saving quetly
            $eoi->saveQuietly();
        }
    }
    
    /**
     * Handle the Eoi "saving" event.
     */
    public function saving(EOI $eoi): void
    {
        if ($eoi->status === 'open' && 
            $eoi->submission_deadline !== null && 
            Carbon::parse($eoi->submission_deadline)->startOfDay()->isPast()) {
            
            $eoi->status = 'closed';
        }
    }
}
