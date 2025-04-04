<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApprovalWorkflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_name',
        'min_amount',
        'max_amount',
        'approval_workflow_type',
        'is_active'
    ];
    /**
     * Get the steps for this workflow.
     */
    public function approvalSteps()
    {
        return $this->hasMany(ApprovalStep::class, 'approval_workflow_id');
    }

    /**
     * Get all approval requests that use this workflow.
     */
    public function approvalRequests()
    {
        return $this->hasManyThrough(RequestApproval::class, ApprovalStep::class, 'approval_workflow_id', 'approval_step_id');
    }
}
