<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
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
    public function rules()
    {
        // dd();
       $this->route('product') ? $this->route('product')->id : null;

        return [
            'name' => 'required|string|max:255',            
            'category_id' => 'required|exists:product_categories,id',
            'unit'=>'required|string|max:255',
            'in_stock_quantity'=>'required',
            'specifications'=> 'required|string|max:255'
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'The product name is required.',
            'category_id.required' => 'The category is required.',
            'category_id.exists' => 'The selected category is invalid.',
            'unit.required' => 'The unit is required.',
            'in_stock_quantity.required' => 'The stock quantity is required.',
            'in_stock_quantity.integer' => 'The stock quantity must be a number.',
            'in_stock_quantity.min' => 'The stock quantity cannot be negative.',
            'specifications.required' => 'The specifications field is required.',
        ];
    }
}
