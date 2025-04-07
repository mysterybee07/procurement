<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApprovalWorkflowRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
           'workflow_name' => 'required|string|max:255|unique:approval_workflows,workflow_name',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0|gt:min_amount',
            'approval_workflow_type' => 'required|in:sequential,parallel',
            'is_active' => 'boolean',
            'approvalSteps' => 'required|array|min:1',
            'approvalSteps.*.step_number' => 'required|integer|min:1',
            'approvalSteps.*.step_name' => 'required|string|max:255',
            'approvalSteps.*.approver_role' => 'required|string|exists:roles,name',
            'approvalSteps.*.is_mandatory' => 'boolean',
            'approvalSteps.*.allow_delegation' => 'boolean',
        ];
    }
}
