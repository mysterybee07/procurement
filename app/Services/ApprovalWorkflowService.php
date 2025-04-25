<?php
namespace App\Services;

use App\Models\ApprovalStep;
use App\Models\RequestApproval;
use Illuminate\Support\Facades\DB;

class ApprovalWorkflowService
{
    public function assignWorkflowToEntity($entity, $workflow, $entityType)
    {
        DB::beginTransaction();

        // Save the fully qualified class name of the entity type
        // $entity->entity_type = get_class($entity);
        $entity->approval_workflow_id = $workflow->id;
        
        // dd($entity); 

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
                    'entity_id' => $entity->id,
                    'entity_type' => $entityType,
                    'status' => 'pending',
                    'approval_step_id' => $firstStep->id,
                ]);
            }

        } elseif ($workflow->approval_workflow_type === 'parallel') {
            $steps = ApprovalStep::where('approval_workflow_id', $workflow->id)
                ->orderBy('step_number', 'asc')
                ->get();

            foreach ($steps as $step) {
                RequestApproval::create([
                    'entity_id' => $entity->id,
                    'entity_type' => $entityType,
                    'status' => 'pending',
                    'approval_step_id' => $step->id,
                ]);
            }

            if ($steps->count() > 0) {
                $entity->current_approval_step = $steps[0]->step_name;
                $entity->save();
            }
        }

        DB::commit();
    }
}
