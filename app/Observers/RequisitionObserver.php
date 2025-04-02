<?php

namespace App\Observers;

use App\Models\Requisition;

class RequisitionObserver
{
    /**
     * Handle the Requisition "created" event.
     */
    public function created(Requisition $requisition): void
    {
        
    }

    /**
     * Handle the Requisition "updated" event.
     */
    public function updated(Requisition $requisition): void
    {
        //
    }

    /**
     * Handle the Requisition "deleted" event.
     */
    public function deleted(Requisition $requisition): void
    {
        //
    }

    /**
     * Handle the Requisition "restored" event.
     */
    public function restored(Requisition $requisition): void
    {
        //
    }

    /**
     * Handle the Requisition "force deleted" event.
     */
    public function forceDeleted(Requisition $requisition): void
    {
        //
    }

    public function saving(Requisition $requisition): void
    {
        if ($requisition->eoi_id !== null && 
            ($requisition->isDirty('eoi_id') || $requisition->wasRecentlyCreated)) {
            
            $requisition->status = 'EOI created';
        }
    }
}
