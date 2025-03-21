<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EOI extends Model
{
    use HasFactory;
    
    protected $table = 'eois';
    
    protected $fillable = [
        'created_by',
        'title',
        'description',
        'estimated_budget',
        'submission_date',
        'status',
        'current_approval_step',
        'approval_workflow_id',
        'submission_deadline',
        'evaluation_criteria',
        'eoi_number',
        'allow_partial_item_submission',
    ];
    
    // Relationship with user who created the EOI
    public function documents()
    {
        return $this->belongsToMany(Document::class, 'eoi_documents', 'eoi_id', 'document_id');
    }
    public function requisitions()
    {
        return $this->belongsToMany(Document::class, 'eoi_requisitions', 'eoi_id', 'requisition_id');
    }

    /**
     * Get the approval workflow for this EOI.
     */
    // public function approvalWorkflow()
    // {
    //     return $this->belongsTo(ApprovalWorkflow::class);
    // }

    /**
     * Get the user who created this EOI.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
