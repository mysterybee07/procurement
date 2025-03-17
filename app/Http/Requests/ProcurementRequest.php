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
        return [
            // Procurement request validation
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'required_date' => 'required|date|after_or_equal:today',
            'requester' => 'required|exists:users,id',
            'status' => 'required|string|in:pending,approved,rejected',
            'urgency' => 'required|string|in:low,medium,high',
            'eoi_id' => 'nullable|exists:eois,id',

            // Request Items validation (Array)
            'request_items' => 'required|array|min:1',
            'request_items.*.procurement_id' => 'required|exists:procurements,id',
            'request_items.*.name' => 'required|string|max:255',
            'request_items.*.quantity' => 'required|integer|min:1',
            'request_items.*.unit' => 'required|string|max:50',
            'request_items.*.estimated_unit_price' => 'required|numeric|min:0',
            'request_items.*.core_specifications' => 'required|string',
            'request_items.*.category_id' => 'required|exists:categories,id',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            // procurement messages
            'title.required' => 'The title is required.',
            'title.string' => 'The title must be a string.',
            'title.max' => 'The title must not exceed 255 characters.',
            
            'required_date.required' => 'The required date is required.',
            'required_date.date' => 'Please provide a valid date.',
            'required_date.after_or_equal' => 'The required date cannot be in the past.',

            'requester.required' => 'The requester field is required.',
            'requester.exists' => 'The selected requester does not exist.',

            'status.required' => 'The status is required.',
            'status.in' => 'The status must be pending, approved, or rejected.',

            'urgency.required' => 'The urgency is required.',
            'urgency.in' => 'The urgency must be low, medium, or high.',

            'eoi_id.exists' => 'The selected EOI does not exist.',

            // request_items messages
            'request_items.required' => 'At least one request item is required.',
            'request_items.array' => 'Request items must be an array.',

            'request_items.*.procurement_id.required' => 'Each request item must have a procurement ID.',
            'request_items.*.procurement_id.exists' => 'Invalid procurement ID.',

            'request_items.*.name.required' => 'Each request item must have a name.',
            'request_items.*.name.string' => 'Each request item name must be a string.',
            'request_items.*.name.max' => 'Each request item name must not exceed 255 characters.',

            'request_items.*.quantity.required' => 'Each request item must have a quantity.',
            'request_items.*.quantity.integer' => 'Quantity must be an integer.',
            'request_items.*.quantity.min' => 'Quantity must be at least 1.',

            'request_items.*.unit.required' => 'Each request item must have a unit.',
            'request_items.*.unit.string' => 'Unit must be a valid string.',
            'request_items.*.unit.max' => 'Unit must not exceed 50 characters.',

            'request_items.*.estimated_unit_price.required' => 'Each request item must have an estimated unit price.',
            'request_items.*.estimated_unit_price.numeric' => 'The estimated unit price must be a number.',
            'request_items.*.estimated_unit_price.min' => 'The estimated unit price must be at least 0.',

            'request_items.*.core_specifications.required' => 'Core specifications are required for each item.',
            'request_items.*.core_specifications.string' => 'Core specifications must be a valid string.',

            'request_items.*.category_id.required' => 'Each request item must have a category ID.',
            'request_items.*.category_id.exists' => 'Invalid category ID.',
        ];
    }
}
