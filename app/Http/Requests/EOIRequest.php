<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EOIRequest extends FormRequest
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
    $this->route('eois') ? $this->route('eois')->id : null;
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'submission_date' => 'required|date',
            'submission_deadline' => 'nullable|date|after_or_equal:submission_date',
            'evaluation_criteria' => 'nullable|string',
            'allow_partial_item_submission' => 'boolean',
            'documents' => 'nullable|array',
            'documents.*' => 'exists:documents,id',
            'procurement_ids' => 'nullable|array',
            'procurement_ids.*' => 'exists:procurements,id',
        ];
    }

    /**
     * Custom error messages for validation.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The title is required.',
            'title.string' => 'The title must be a string.',
            'title.max' => 'The title cannot exceed 255 characters.',
            
            'submission_date.required' => 'The submission date is required.',
            'submission_date.date' => 'The submission date must be a valid date.',
            
            'submission_deadline.date' => 'The submission deadline must be a valid date.',
            'submission_deadline.after_or_equal' => 'The submission deadline cannot be before the submission date.',
            
            'documents.array' => 'The selected documents must be an array.',
            'documents.*.exists' => 'One or more selected documents do not exist.',

            'procurement_ids.array' => 'The procurement IDs must be an array.',
            'procurement_ids.*.exists' => 'One or more selected procurements do not exist.',
        ];
    }

}
