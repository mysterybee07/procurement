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
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // dd($this);
       $this->route('eois') ? $this->route('eois')->id : null;
        
        return [
            'title' => [
                'required', 
                'string', 
                'max:255', 
                'unique:procurements,title,' . $this->id,
            ],
            'description' => [
                'required', 
                'string'
            ],
            'publish_date' => [
                'required', 
                'date', 
                'after_or_equal:today'
            ],
            'submission_deadline' => [
                'required', 
                'date', 
                'after_or_equal:today'
            ],            
            'status' => [
                'required', 
                'string', 
                'in:draft,submitted,updated'
            ],
            'selected_documents'=>[
                'required', 
                'array', 
                'min:1',
            ],
            'selected_documents.*' => [
                'exists:documents,id',
            ]
        ];
    }

/**
 * Get custom error messages for validation rules.
 */
    public function messages(): array
    {
        // dd($this);
        return [
            'title.required' => 'The title is required.',
            'title.string' => 'The title must be a string.',
            'title.max' => 'The title must not exceed 255 characters.',
            'title.unique' => 'This procurement title has already been used.',

            'required_date.required' => 'The required date is required.',
            'required_date.date' => 'Please provide a valid date.',
            'required_date.after_or_equal' => 'The required date cannot be in the past.',

            'status.required' => 'The status is required.',
            'status.in' => 'The status must be either draft or submitted.',

            'urgency.required' => 'The urgency is required.',
            'urgency.in' => 'The urgency must be low, medium, or high.',

            'requestItems.required' => 'At least one request item is required.',
            'requestItems.array' => 'Request items must be an array.',
            'requestItems.min' => 'You must add at least one request item.',

            'requestItems.*.procurement_id.required' => 'Each request item must have a procurement ID.',
            'requestItems.*.procurement_id.exists' => 'Invalid procurement ID.',


            'requestItems.*.required_quantity.required' => 'Each request item must have a required_quantity.',
            'requestItems.*.required_quantity.integer' => 'Quantity must be an integer.',
            'requestItems.*.required_quantity.min' => 'Quantity must be at least 1.',

            // 'requestItems.*.additional_specifications.required' => 'Core specifications are required for each item.',
            // 'requestItems.*.additional_specifications.string' => 'Core specifications must be a valid string.',

            'requestItems.*.product_id.required' => 'Each request item must have a category ID.',
            'requestItems.*.product_id.exists' => 'Invalid category ID.',
        ];
    }

}
