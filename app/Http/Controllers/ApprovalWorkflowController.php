<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApprovalWorkflowRequest;
use App\Models\ApprovalWorkflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class ApprovalWorkflowController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('approval-workflow/list-approval-workflows');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::all();
        // dd($roles);
        return Inertia::render('approval-workflow/approval-workflow-form',[
            'roles'=>$roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ApprovalWorkflowRequest $request)
    {
        
        $validated = $request->validated();
        try {
            DB::beginTransaction();

            // Create the main workflow
            $workflow = ApprovalWorkflow::create([
                'workflow_name' => $validated['workflow_name'],
                'min_amount' => $validated['min_amount'] ?? null,
                'max_amount' => $validated['max_amount'] ?? null,
                'approval_workflow_type' => $validated['approval_workflow_type'],
                'is_active' => $validated['is_active'],
            ]);

            // Create each approval step
            foreach ($validated['approvalSteps'] as $stepData) {
                $workflow->approvalSteps()->create([
                    'step_number' => $stepData['step_number'],
                    'step_name' => $stepData['step_name'],
                    'approver_role' => $stepData['approver_role'],
                    'is_mandatory' => $stepData['is_mandatory'],
                    'allow_delegation' => $stepData['allow_delegation'],
                ]);
            }

            DB::commit();

            return redirect()->route('approval-workflows.index')
                ->with('message', 'Approval workflow created successfully')
                ->with('workflow', $workflow);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create approval workflow. ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ApprovalWorkflow $approvalWorkflow)
    {
        
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ApprovalWorkflow $approvalWorkflow)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ApprovalWorkflow $approvalWorkflow)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ApprovalWorkflow $approvalWorkflow)
    {
        //
    }
}
