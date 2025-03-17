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
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    // Relationship with approval workflow
    // public function approvalWorkflow()
    // {
    //     return $this->belongsTo(ApprovalWorkflow::class, 'approval_workflow_id');
    // }
    
    // Relationship with procurements
    public function procurements()
    {
        return $this->hasMany(Procurement::class, 'eoi_id');
    }
}
