<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestApproval extends Model
{
    use HasFactory;

    protected $table = 'request_approval';
    
    protected $fillable = [
        'entity_id',
        'entity_type',
        'status',
        'comments', 
        'action_date',
        'approval_step_id',
        'delegate_to',
        'approver_id'
    ];

    protected $casts = [
        'action_date' => 'datetime',
    ];

    /**
     * Get the approvable entity (polymorphic).
     * This could be a purchase request, invoice, time-off request, etc.
     */
    // public function approvable(): MorphTo
    // {
    //     return $this->morphTo('approvable', 'entity_type', 'entity_id');
    // }

    /**
     * Get the approval step associated with this request.
     */
    public function approvalStep()
    {
        return $this->belongsTo(ApprovalStep::class, 'approval_step_id');
    }

    /**
     * Get the delegated user for this approval request.
     */
    public function delegate()
    {
        return $this->belongsTo(User::class, 'delegate_to');
    }

    /**
     * Get the user who approved this request.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
