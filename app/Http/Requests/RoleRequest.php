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
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        $roleId = $this->route('role') ? $this->route('role')->id : null;

        return [
            [
                'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
                'selectedPermissions' => ['required', 'array', 'min:1'],
                'selectedPermissions.*' => ['exists:permissions,id']
            ],
        ];
    }

    public function messages()
    {
        return [
            'role_name.required' => 'The role name is required.',
            'selectedPermissions.required' => 'Please select at least one permission',
            'selectedPermissions.min' => 'Please select at least one permission'
        ];
    }
}
