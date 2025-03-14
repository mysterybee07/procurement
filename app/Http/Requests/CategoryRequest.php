<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
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
        $categoryId = $this->route('category') ? $this->route('category')->id : null;

        return [
            'category_name' => 'required|string|max:255',
            'category_code' => [
                'required',
                'string',
                'max:255',
                'unique:product_categories,category_code,'.$this->id
            ],
            'parent_category_id' => 'nullable|exists:product_categories,id',
            'description' => 'nullable|string',
        ];
    }

    public function messages()
    {
        return [
            'category_name.required' => 'The category name is required.',
            'category_code.required' => 'The category code is required.',
            'category_code.unique' => 'This category code is already taken.',
            'parent_category_id.exists' => 'The selected parent category is invalid.',
        ];
    }
}
