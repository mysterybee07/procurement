<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApprovalWorkflowRequest;
use App\Models\ApprovalStep;
use App\Models\ApprovalWorkflow;
use App\Models\RequestApproval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Yajra\DataTables\Contracts\DataTable;
use Yajra\DataTables\DataTables;

class ApprovalWorkflowController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // $approvalWorkflows= ApprovalWorkflow::with('approvalSteps')->get();
        // dd($approvalWorkflows);
        if($request->ajax() && $request->expectsJson()){
            $approvalWorkflows = DB::table('approval_workflows as aw')
                ->join('approval_steps as as', 'as.approval_workflow_id', '=', 'aw.id')
                ->select([
                    'aw.id',
                    'aw.workflow_name',
                    'aw.approval_workflow_type',
                    DB::raw('COUNT(as.step_number) as step_count')
                ])
                ->groupBy('aw.id', 'aw.workflow_name', 'aw.approval_workflow_type');

            return DataTables::of($approvalWorkflows)
                ->filterColumn('workflow_name', function($query, $keyword){
                    $query->where('aw.workflow_name','like',"%{$keyword}%");
                })
                ->addColumn('actions', function ($row) {
                    return '<a href="'.route('approval-workflows.edit', $row->id).'" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</a>' .
                            '<a href="'.route('approval-workflow.show', $row->id).'" class="text-indigo-600 hover:text-indigo-900 mr-3">Details</a>' .
                            '<button data-id="'.$row->id.'" class="text-red-600 hover:text-red-900 delete-workflow">Delete</button>';
                })
                ->rawColumns(['actions'])
                ->toJson();
        }

        return Inertia::render('approval-workflow/list-approval-workflows',[
            'flash'=>[
                'message'=>session('message'),
                'error'=>session('error'),
            ]
        ]);
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

    public function assignWorkflow(Request $request, $entityId)
    {
        // Validate the incoming request
        $validator = Validator::make($request->all(), [
            'approval_workflow_id' => 'required|exists:approval_workflows,id',
            // 'entity_type' => 'required|string|in:\App\Models\EOI', 
        ]);
    
        if ($validator->fails()) {
            return back()->withErrors($validator);
        }
    
        $entityType = "\App\Models\EOI";
    
        $entityClass = $this->getEntityModelClass($entityType);
    
        if (!$entityClass) {
            return back()->withErrors(['entity_type' => 'Invalid entity type']);
        }
    
        $workflow = ApprovalWorkflow::findOrFail($request->approval_workflow_id);
        $entity = $entityClass::findOrFail($entityId);
    
        if (!is_null($entity->approval_workflow_id)) {
            return back()->withErrors([
                'approval_workflow_id' => 'This entity already has an assigned workflow.'
            ]);
        }
    
        DB::beginTransaction();
    
        try {
            $entity->approval_workflow_id = $workflow->id;
    
            if (isset($entity->status) && $entity->status === 'draft') {
                $entity->status = 'submitted';
            }
    
            $entity->save();
    
            if ($workflow->approval_workflow_type === 'sequential') {
                $firstStep = ApprovalStep::where('approval_workflow_id', $workflow->id)
                    ->orderBy('step_number', 'asc')
                    ->first();
    
                if ($firstStep) {
                    $entity->current_approval_step = $firstStep->step_name;
                    $entity->save();
    
                    RequestApproval::create([
                        'entity_id' => $entityId,
                        'entity_type' => $entityType,
                        'status' => 'pending',
                        'approval_step_id' => $firstStep->id,
                    ]);
                }
    
            } else if ($workflow->approval_workflow_type === 'parallel') {
                $steps = ApprovalStep::where('approval_workflow_id', $workflow->id)
                    ->orderBy('step_number', 'asc')
                    ->get();
    
                foreach ($steps as $step) {
                    RequestApproval::create([
                        'entity_id' => $entityId,
                        'entity_type' => $entityType,
                        'status' => 'pending',
                        'approval_step_id' => $step->id,
                    ]);
                }
    
                if (count($steps) > 0) {
                    $entity->current_approval_step = $steps[0]->step_name;
                    $entity->save();
                }
            }
    
            DB::commit();
    
            return redirect()->route('eois.index')->with('message', 'Approval workflow has been assigned successfully');
    
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to assign workflow.']);
        }
    }
    
    private function getEntityModelClass($entityType)
    {
        $entityMap = [
            '\App\Models\EOI' => \App\Models\EOI::class,
            // Add more entity types here as needed
        ];
    
        return $entityMap[$entityType] ?? null;
    }
}
