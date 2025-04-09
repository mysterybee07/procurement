<?php

namespace App\Http\Controllers;

use App\Models\ApprovalStep;
use App\Models\RequestApproval;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApprovalController extends Controller
{
    // render dashboad
    public function approverDashboard()
    {
        $user = Auth::user();

        $requestApprovals = RequestApproval::with('entity', 'step')
            ->get()
            ->filter(function ($approval) use ($user) {
                return $approval->step && $user->hasRole($approval->step->approver_role);
            })
            ->values();

        return Inertia::render('approval-workflow/approval-dashboard', [
            'requestApprovals' => $requestApprovals,
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ],
        ]);
    }

    // to approve
    public function approve(Request $request, $requestApprovalId)
    {
        $request->validate([
            'comments' => 'nullable|string|max:500',
        ]);
        
        $approvalItem = RequestApproval::with('step')->findOrFail($requestApprovalId);
        $user = auth()->user();
        
        if (!$user->hasRole($approvalItem->step->approver_role) && 
            $approvalItem->step->delegated_to !== $user->id) {
            return redirect()->back()->with('error', 'You are not authorized to approve this item.');
        }
        
        $approvalItem->status = 'approved';
        $approvalItem->comments = $request->comments;
        $approvalItem->approver_id = $user->id;
        $approvalItem->action_date = now();
        $approvalItem->save();
        
        // Check if this is a sequential or parallel workflow
        $workflow = $approvalItem->step->approvalWorkflow;
        // dd($workflow);
        if ($workflow && $workflow->approval_workflow_type === 'sequential') {
            $nextStep = ApprovalStep::where('approval_workflow_id', $approvalItem->step->approval_workflow_id)
                ->where('step_number', '>', $approvalItem->step->step_number)
                ->orderBy('step_number', 'asc')
                ->first();
                
            if ($nextStep) {
                // Create a new request approval for the next step
                $newApproval = RequestApproval::create([
                    'entity_id' => $approvalItem->entity_id,
                    'entity_type' => $approvalItem->entity_type,
                    'status' => 'pending',
                    'approval_step_id' => $nextStep->id,
                ]);
                
                // Update the entity's current approval step
                $entity = $this->getEntityInstance($approvalItem->entity_type, $approvalItem->entity_id);
                if ($entity) {
                    $entity->current_approval_step = $nextStep->step_name;
                    $entity->save();
                }
            } else {
                // This was the final step, mark the entity as completely approved
                $entity = $this->getEntityInstance($approvalItem->entity_type, $approvalItem->entity_id);
                if ($entity) {
                    $entity->status = 'approved';
                    $entity->current_approval_step = null;
                    $entity->save();
                }
            }
        } else {
            // For parallel workflow, check if all mandatory steps are approved
            $workflowId = $approvalItem->step->approval_workflow_id;
            $allStepsApproved = RequestApproval::whereHas('step', function ($query) use ($workflowId) {
                    $query->where('approval_workflow_id', $workflowId)
                        ->where('is_mandatory', true);
                })
                ->where('entity_id', $approvalItem->entity_id)
                ->where('entity_type', $approvalItem->entity_type)
                ->where('status', '!=', 'approved')
                ->count() === 0;
                
            if ($allStepsApproved) {
                // All mandatory steps are approved, mark the entity as approved
                $entity = $this->getEntityInstance($approvalItem->entity_type, $approvalItem->entity_id);
                if ($entity) {
                    $entity->status = 'approved';
                    $entity->current_approval_step = null;
                    $entity->save();
                }
            }
        }
        
        return redirect()->back()->with('message', 'Item approved successfully.');
    }
    
    public function reject(Request $request, $requestApprovalId)
{
    $request->validate([
        'comments' => 'nullable|string|max:500',
    ]);
    
    $approvalItem = RequestApproval::with('step')->findOrFail($requestApprovalId);
    $user = auth()->user();
    
    if (!$user->hasRole($approvalItem->step->approver_role) && 
        $approvalItem->step->delegated_to !== $user->id) {
        return redirect()->back()->with('error', 'You are not authorized to reject this item.');
    }
    
    $approvalItem->status = 'rejected';
    $approvalItem->comments = $request->comments;
    $approvalItem->approver_id = $user->id;
    $approvalItem->action_date = now();
    $approvalItem->save();
    
    // Get the workflow
    $workflow = $approvalItem->step->approvalWorkflow;
    
    if ($workflow && $workflow->approval_workflow_type === 'sequential') {
        // For sequential workflow, immediate rejection
        $entity = $this->getEntityInstance($approvalItem->entity_type, $approvalItem->entity_id);
        if ($entity) {
            $entity->status = 'rejected';
            $entity->current_approval_step = null;
            $entity->save();
        }
    } else {
        // For parallel workflow, check if this is a mandatory step
        if ($approvalItem->step->is_mandatory) {
            // If a mandatory step is rejected, the entire process is rejected
            $entity = $this->getEntityInstance($approvalItem->entity_type, $approvalItem->entity_id);
            if ($entity) {
                $entity->status = 'rejected';
                $entity->current_approval_step = null;
                $entity->save();
            }
        } else {
            // If a non-mandatory step is rejected, check if all other mandatory steps are approved
            // to determine if the process should continue
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
                // All mandatory steps are approved, mark the entity as approved
                $entity = $this->getEntityInstance($approvalItem->entity_type, $approvalItem->entity_id);
                if ($entity) {
                    $entity->status = 'approved';
                    $entity->current_approval_step = null;
                    $entity->save();
                }
            }
        }
    }
    
    return redirect()->back()->with('message', 'Item rejected successfully.');
}
    /**
     * Get entity instance based on entity type and ID
     */
    private function getEntityInstance($entityType, $entityId)
    {
        if (class_exists($entityType)) {
            return $entityType::find($entityId);
        }
        
        return null;
    }

    public function pendingApprovals()
    {
        $user = Auth::user();
        
        // Get approvals where current user is the approver
        $pendingApprovals = RequestApproval::with(['entity', 'step', 'workflow'])
            ->where(function($query) use ($user) {
                $query->whereHas('step', function($q) use ($user) {
                    $q->where('approver_role', $user->role);
                })
                ->orWhere('delegate_to', $user->id);
            })
            ->where('status', 'pending')
            ->get()
            ->map(function($approval) {
                return $this->formatApprovalResponse($approval);
            });
            dd($pendingApprovals);

        return response()->json($pendingApprovals);
    }
    // Get completed approvals
    public function completedApprovals()
    {
        $user = Auth::user();
        
        $completedApprovals = RequestApproval::with(['entity', 'step', 'workflow'])
            ->where(function($query) use ($user) {
                $query->where('approver_id', $user->id)
                    ->orWhere('delegate_to', $user->id);
            })
            ->whereIn('status', ['approved', 'rejected'])
            ->get()
            ->map(function($approval) {
                return $this->formatApprovalResponse($approval);
            });

        return response()->json($completedApprovals);
    }

    // Delegate approval
    public function delegate(Request $request, $id)
    {
        $request->validate([
            'delegate_to' => 'required|exists:users,id'
        ]);

        $approval = RequestApproval::findOrFail($id);
        $user = Auth::user();

        if (!$approval->step->allow_delegation) {
            return response()->json(['error' => 'Delegation not allowed for this step'], 400);
        }

        if (!$this->canUserApprove($user, $approval)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $approval->update([
            'delegate_to' => $request->delegate_to
        ]);

        return response()->json(['message' => 'Delegation successful']);
    }

    // Get available delegates for a step
    public function getDelegates($approvalId)
    {
        $approval = RequestApproval::findOrFail($approvalId);
        
        if (!$approval->step->allow_delegation) {
            return response()->json(['error' => 'Delegation not allowed for this step'], 400);
        }

        // Get users with same role as the step's approver role
        $delegates = User::where('role', $approval->step->approver_role)
            ->where('id', '!=', Auth::id())
            ->get(['id', 'name', 'role']);

        return response()->json($delegates);
    }

    // Helper methods
    private function canUserApprove($user, $approval)
    {
        return $approval->step->approver_role === $user->role || 
               $approval->delegate_to === $user->id;
    }

    private function handleNextStep($approval)
    {
        if ($approval->workflow->approval_workflow_type === 'sequential') {
            $nextStep = $approval->workflow->steps()
                ->where('step_number', '>', $approval->step->step_number)
                ->orderBy('step_number')
                ->first();

            if ($nextStep) {
                RequestApproval::create([
                    'entity_id' => $approval->entity_id,
                    'entity_type' => $approval->entity_type,
                    'approval_step_id' => $nextStep->id,
                    'status' => 'pending'
                ]);
            }
        }
    }

    private function formatApprovalResponse($approval)
    {
        return [
            'id' => $approval->id,
            'entity_id' => $approval->entity_id,
            'entity_type' => $approval->entity_type,
            'entity_name' => $approval->entity->name ?? 'Unknown',
            'eoi_number' => $approval->entity->eoi_number ?? 'N/A',
            'created_date' => $approval->created_at->toISOString(),
            'current_step' => [
                'id' => $approval->step->id,
                'step_number' => $approval->step->step_number,
                'step_name' => $approval->step->step_name,
                'approver_role' => $approval->step->approver_role,
                'status' => $approval->status,
                'action_date' => $approval->action_date?->toISOString(),
                'comments' => $approval->comments,
                'delegated_to' => $approval->delegate?->name,
                'is_mandatory' => $approval->step->is_mandatory,
                'allow_delegation' => $approval->step->allow_delegation
            ],
            'workflow' => [
                'id' => $approval->workflow->id,
                'workflow_name' => $approval->workflow->workflow_name,
                'approval_workflow_type' => $approval->workflow->approval_workflow_type
            ],
            'steps' => $approval->workflow->steps->map(function($step) {
                return [
                    'id' => $step->id,
                    'step_number' => $step->step_number,
                    'step_name' => $step->step_name,
                    'approver_role' => $step->approver_role,
                    'is_mandatory' => $step->is_mandatory,
                    'allow_delegation' => $step->allow_delegation
                ];
            }),
            'estimated_budget' => $approval->entity->estimated_budget ?? 0,
            'deadline' => $approval->entity->deadline?->toISOString(),
            'status' => $approval->status,
            'action_date' => $approval->action_date?->toISOString()
        ];
    }
}
