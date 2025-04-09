<?php

namespace App\Http\Controllers;

use App\Models\ApprovalStep;
use App\Models\RequestApproval;
use App\Models\User;
use App\Services\EntityService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApprovalController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('permission:view approvals', only: ['approverDashboard']),
            new Middleware('permission:approve and reject requests', only: ['approve', 'reject']),
            // new Middleware('permission:edit approval workflows', only: ['edit']),
            // new Middleware('permission:delete approval workflows', only: ['destroy']),
        ];
    }

    public function approverDashboard(EntityService $entityService)
    {
        $user = Auth::user();
        
        // Get all request approvals
        $requestApprovals = RequestApproval::all()
            ->filter(fn ($approval) => $approval->step && $user->hasRole($approval->step->approver_role))
            ->values();
    
        // Map entity_type to the corresponding model dynamically
        $requestApprovals->each(function ($approval) use ($entityService) {
            $entityClass = $entityService->getEntityModelClass($approval->entity_type);
    
            if ($entityClass && class_exists($entityClass)) {
                // Eager load the entity based on the resolved class
                $approval->entity = $entityClass::find($approval->entity_id);
            }
        });
    
        return Inertia::render('approval-workflow/approval-dashboard', [
            'requestApprovals' => $requestApprovals,
            'flash' => ['message' => session('message'), 'error' => session('error')],
        ]);
    }


    // to approve the request
    public function approve(Request $request, $requestApprovalId)
    {
        $request->validate(['comments' => 'nullable|string|max:500']);
        $approvalItem = RequestApproval::with('step')->findOrFail($requestApprovalId);
        $user = auth()->user();
        
        if (!$this->canUserApprove($user, $approvalItem)) {
            return redirect()->back()->with('error', 'You are not authorized to approve this item.');
        }
        
        $this->updateApprovalStatus($approvalItem, 'approved', $request->comments, $user->id);
        $this->processWorkflowAfterAction($approvalItem);
        
        return redirect()->back()->with('message', 'Item approved successfully.');
    }

    // to reject the request    
    public function reject(Request $request, $requestApprovalId)
    {
        $request->validate(['comments' => 'nullable|string|max:500']);
        $approvalItem = RequestApproval::with('step')->findOrFail($requestApprovalId);
        $user = auth()->user();
        
        if (!$this->canUserApprove($user, $approvalItem)) {
            return redirect()->back()->with('error', 'You are not authorized to reject this item.');
        }
        
        $this->updateApprovalStatus($approvalItem, 'rejected', $request->comments, $user->id);
        $this->processWorkflowAfterRejection($approvalItem);
        
        return redirect()->back()->with('message', 'Item rejected successfully.');
    }

    // Helper methods
    private function canUserApprove($user, $approval)
    {
        return $user->hasRole($approval->step->approver_role) || 
               $approval->step->delegated_to === $user->id;
    }

    private function updateApprovalStatus($approval, $status, $comments, $approverId)
    {
        $approval->status = $status;
        $approval->comments = $comments;
        $approval->approver_id = $approverId;
        $approval->action_date = now();
        $approval->save();
    }

    private function processWorkflowAfterAction($approvalItem)
    {
        $workflow = $approvalItem->step->approvalWorkflow;
        
        if ($workflow && $workflow->approval_workflow_type === 'sequential') {
            $this->processSequentialApproval($approvalItem);
        } else {
            $this->checkParallelWorkflowCompletion($approvalItem);
        }
    }

    private function processSequentialApproval($approvalItem)
    {
        $nextStep = ApprovalStep::where('approval_workflow_id', $approvalItem->step->approval_workflow_id)
            ->where('step_number', '>', $approvalItem->step->step_number)
            ->orderBy('step_number', 'asc')
            ->first();
            
        if ($nextStep) {
            // Create next step approval
            RequestApproval::create([
                'entity_id' => $approvalItem->entity_id,
                'entity_type' => $approvalItem->entity_type,
                'status' => 'pending',
                'approval_step_id' => $nextStep->id,
            ]);
            
            // Update entity status
            $entity = $this->getEntityInstance($approvalItem->entity_type, $approvalItem->entity_id);
            if ($entity) {
                $entity->current_approval_step = $nextStep->step_name;
                $entity->save();
            }
        } else {
            // Final step - mark entity as approved
            $this->updateEntityStatus($approvalItem, 'approved');
        }
    }

    private function processWorkflowAfterRejection($approvalItem)
    {
        $workflow = $approvalItem->step->approvalWorkflow;
        
        if ($workflow && $workflow->approval_workflow_type === 'sequential') {
            // Sequential workflow - immediate rejection
            $this->updateEntityStatus($approvalItem, 'rejected');
        } else if ($approvalItem->step->is_mandatory) {
            // Parallel workflow - mandatory step rejected
            $this->updateEntityStatus($approvalItem, 'rejected');
        } else {
            // Non-mandatory step in parallel workflow
            $this->checkParallelWorkflowCompletion($approvalItem);
        }
    }

    private function checkParallelWorkflowCompletion($approvalItem)
    {
        $workflowId = $approvalItem->step->approval_workflow_id;
        $allMandatoryStepsApproved = RequestApproval::whereHas('step', function ($query) use ($workflowId) {
                $query->where('approval_workflow_id', $workflowId)
                    ->where('is_mandatory', true);
            })
            ->where('entity_id', $approvalItem->entity_id)
            ->where('entity_type', $approvalItem->entity_type)
            ->where('status', '!=', 'approved')
            ->count() === 0;
            
        if ($allMandatoryStepsApproved) {
            $this->updateEntityStatus($approvalItem, 'approved');
        }
    }

    private function updateEntityStatus($approvalItem, $status)
    {
        try {
            $entityClass = app(EntityService::class)->getEntityModelClass($approvalItem->entity_type);

            // Check if the class is valid and exists
            if ($entityClass && class_exists($entityClass)) {
                $entity = $entityClass::find($approvalItem->entity_id);
                
                if ($entity) {
                    if ($status === 'approved') {
                        $entity->status = $status;
                        $entity->current_approval_step = 'approved by all required approvers';
                        
                        // Check if there is a next step in the approval process
                        $nextStep = ApprovalStep::where('approval_workflow_id', $approvalItem->step->approval_workflow_id)
                            ->where('step_number', '>', $approvalItem->step->step_number)
                            ->orderBy('step_number', 'asc')
                            ->first();
                        
                        // If there is a next step, update the current approval step
                        if ($nextStep) {
                            $entity->current_approval_step = 'waiting for ' . $nextStep->step_name;
                        }
                    }
                    elseif ($status === 'rejected') {
                        $entity->status = $status;
                        
                        // Get the approver's role from the approval step
                        $approverRole = $approvalItem->step->approver_role;  
                        
                        // Set the current approval step to 'rejected by <approver_role>'
                        $entity->current_approval_step = 'rejected by ' . $approverRole;
                    }

                    // Save the updated entity
                    $entity->save();
                    
                    // Return success message
                    return redirect()->back()->with('message', 'Entity status updated successfully.');
                } else {
                    // Entity not found in the database
                    // \Log::error("Entity not found for type {$approvalItem->entity_type} and ID {$approvalItem->entity_id}");
                    return redirect()->back()->withErrors(['error' => 'Entity not found.']);
                }
            } else {
                // Invalid entity type or class does not exist
                // \Log::error("Invalid entity class for type {$approvalItem->entity_type}");
                return redirect()->back()->withErrors(['error' => 'Invalid entity type.']);
            }
        } catch (\Exception $e) {
            // Log the exception and return a general error message
            // \Log::error('Error updating entity status: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'An error occurred while updating the entity status. Please try again later.']);
        }
    }

    private function getEntityInstance($entityType, $entityId)
    {
        return class_exists($entityType) ? $entityType::find($entityId) : null;
    }
}