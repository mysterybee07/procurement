<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApprovalStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'approval_workflow_id',
        'approver_role',
        'is_mandatory',
        'step_number',
        'allow_delegation',
        'step_name'
    ];

    /**
     * Get the workflow that this step belongs to.
     */
    public function approvalWorkflow()
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'approval_workflow_id');
    }

    /**
     * Get all approval requests for this step.
     */
    public function approvalRequests()
    {
        return $this->hasMany(RequestApproval::class, 'approval_step_id');
    }
}
