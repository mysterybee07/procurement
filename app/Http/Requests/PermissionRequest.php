<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PermissionRequest extends FormRequest
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
        // Retrieve role ID from the route, if available
        $roleId = $this->route('permissions') ? $this->route('permissions')->id : null;

        return [
            'name' => [
                'required', 
                'string', 
                'max:255', 
                'unique:permissions,name,'.$this->id
            ],
        ];
    }

    
    public function messages()
    {
        return [
            'name.required' => 'The role name is required.',
            'name.unique' => 'The role name has already been taken.',
        ];
    }
}
