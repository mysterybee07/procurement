<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcurementRequest extends FormRequest
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
    $procurementId = $this->route('procurements') ? $this->route('procurements')->id : null;
    
    return [
        'title' => [
            'required', 
            'string', 
            'max:255', 
            'unique:procurements,title,' . $this->id,
        ],
        'description' => [
            'nullable', 
            'string'
        ],
        'required_date' => [
            'required', 
            'date', 
            'after_or_equal:today'
        ],
        'status' => [
            'required', 
            'string', 
            'in:draft,submitted,updated'
        ],
        'urgency' => [
            'required', 
            'string', 
            'in:low,medium,high'
        ],
        'requestItems' => [
            'required', 
            'array', 
            'min:1'
        ],
        // 'requestItems.*.procurement_id' => [
        //     'required', 
        //     'exists:procurements,id'
        // ],
        'requestItems.*.name' => [
            'required', 
            'string', 
            'max:255'
        ],
        'requestItems.*.quantity' => [
            'required', 
            'integer', 
            'min:1'
        ],
        'requestItems.*.unit' => [
            'required', 
            'string', 
            'max:50'
        ],
        'requestItems.*.estimated_unit_price' => [
            'required', 
            'numeric', 
            'min:0'
        ],
        'requestItems.*.core_specifications' => [
            'required', 
            'string'
        ],
        'requestItems.*.category_id' => [
            'required', 
            'exists:product_categories,id'
        ],
    ];
    }

/**
 * Get custom error messages for validation rules.
 */
    public function messages(): array
    {
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

            'requestItems.*.name.required' => 'Each request item must have a name.',
            'requestItems.*.name.string' => 'Each request item name must be a string.',
            'requestItems.*.name.max' => 'Each request item name must not exceed 255 characters.',

            'requestItems.*.quantity.required' => 'Each request item must have a quantity.',
            'requestItems.*.quantity.integer' => 'Quantity must be an integer.',
            'requestItems.*.quantity.min' => 'Quantity must be at least 1.',

            'requestItems.*.unit.required' => 'Each request item must have a unit.',
            'requestItems.*.unit.string' => 'Unit must be a valid string.',
            'requestItems.*.unit.max' => 'Unit must not exceed 50 characters.',

            'requestItems.*.estimated_unit_price.required' => 'Each request item must have an estimated unit price.',
            'requestItems.*.estimated_unit_price.numeric' => 'The estimated unit price must be a number.',
            'requestItems.*.estimated_unit_price.min' => 'The estimated unit price must be at least 0.',

            'requestItems.*.core_specifications.required' => 'Core specifications are required for each item.',
            'requestItems.*.core_specifications.string' => 'Core specifications must be a valid string.',

            'requestItems.*.category_id.required' => 'Each request item must have a category ID.',
            'requestItems.*.category_id.exists' => 'Invalid category ID.',
        ];
    }


}
