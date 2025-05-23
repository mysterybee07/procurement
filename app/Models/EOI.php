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
        'publish_date',
        'status',
        'current_approval_step',
        'approval_workflow_id',
        'submission_opening_date',
        'submission_deadline',
        'evaluation_criteria',
        'eoi_number',
        'allow_partial_item_submission',
    ];
    protected $casts = [
        'description' => 'string',
    ];    
    
    // Relationship with user who created the EOI
    public function documents()
    {
        return $this->belongsToMany(Document::class, 'eoi_documents', 'eoi_id', 'document_id');
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

    public function requisitions(){
        return $this->hasMany(Requisition::class, 'eoi_id');
    }
}
