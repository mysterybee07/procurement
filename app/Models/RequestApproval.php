<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestApproval extends Model
{
    protected $fillable = [
        'entity_type',
        'entity_id',
        'approval_step_id',
        'approved_id',
        'action_date',
        'status',
        'comments',
    ];

    /**
     * Polymorphic relation to the entity being approved (e.g., requisition, purchase order).
     */
    public function entity(): MorphTo
    {
        return $this->morphTo('entity', 'entity_type', 'entity_id');
    }

    /**
     * Relation to the current step of the approval workflow.
     */
    public function step(): BelongsTo
    {
        return $this->belongsTo(ApprovalStep::class, 'approval_step_id');
    }

    /**
     * Convenient access to the workflow via the step.
     * This is not a direct relation, but lets you access $approval->workflow.
     */
    public function workflow()
    {
        return $this->step?->workflow();
    }

    /**
     * Relation to the user who approved the request (if already approved).
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope to filter only pending approvals.
     */
    // public function scopePending($query)
    // {
    //     return $query->where('status', 'pending');
    // }

    // /**
    //  * Check if this approval has been completed.
    //  */
    // public function isApproved(): bool
    // {
    //     return $this->status === 'approved';
    // }

    // /**
    //  * Check if this approval is currently pending.
    //  */
    // public function isPending(): bool
    // {
    //     return $this->status === 'pending';
    // }
}
