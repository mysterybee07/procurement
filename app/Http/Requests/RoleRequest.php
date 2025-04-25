<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
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
        $roleId = $this->route('roles') ? $this->route('roles')->id : null;

        return [
            'name' => [
                'required', 
                'string', 
                'max:255', 
                'unique:roles,name,'.$this->id
            ],
            'selectedPermissions' => [
                'required', 
                'array', 
                'min:1',
            ],
            'selectedPermissions.*' => [
                'exists:permissions,id',
            ]
        ];
    }

    
    public function messages()
    {
        return [
            'name.required' => 'The role name is required.',
            'name.unique' => 'The role name has already been taken.',
            'selectedPermissions.required' => 'Please select at least one permission.',
            'selectedPermissions.min' => 'Please select at least one permission.',
            'selectedPermissions.*.exists' => 'One or more of the selected permissions are invalid.',
        ];
    }
    
}
