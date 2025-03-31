<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VendorSubmissionRequest extends FormRequest
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
            'eoi_id' => 'required|exists:eois,id',
            'vendor_id' => 'required|exists:users,id',
            'submission_date' => 'required|date',
            'delivery_date' => 'required|date',
            'remarks' => 'nullable|string',
            'terms_and_conditions' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'items_total_price' => 'required|numeric|min:0',
            'submittedItems' => 'required|array|min:1',
            'submittedItems.*.request_items_id' => 'required|exists:request_items,id',
            'submittedItems.*.actual_unit_price' => 'required|numeric|min:0',
            'submittedItems.*.actual_product_total_price' => 'required|numeric|min:0',
            'submittedItems.*.discount_rate' => 'nullable|numeric|min:0|max:100',
            'submittedItems.*.additional_specifications' => 'nullable|string',
            'submittedDocuments' => 'required|array',
            'submittedDocuments.*.document_id' => 'required|exists:documents,id',
            'submittedDocuments.*.file' => 'nullable|file|max:10240',
        ];
    }
}
