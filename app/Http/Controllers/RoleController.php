<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $roles = Role::with('permissions')->get();
        
        return Inertia::render('', [
            'roles' => $roles
        ]);
    }

    /**
     * Show the form for creating a new role.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $permissions = Permission::all();
        
        return Inertia::render('auth/role/role-form', [
            'permissions' => $permissions,
            'isEditing' => false
        ]);
    }

    /**
     * Store a newly created role in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'selectedPermissions' => ['required', 'array', 'min:1'],
            'selectedPermissions.*' => ['exists:permissions,id']
        ], [
            'selectedPermissions.required' => 'Please select at least one permission',
            'selectedPermissions.min' => 'Please select at least one permission'
        ]);
        
        DB::beginTransaction();
        
        try {
            // Create role
            $role = Role::create(['name' => $validated['name']]);
            
            // Attach permissions
            $role->permissions()->attach($validated['selectedPermissions']);
            
            DB::commit();
            
            return redirect()->route('roles.index')
                ->with('success', 'Role created successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem creating the role. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show the form for editing the specified role.
     *
     * @param  \App\Models\Role  $role
     * @return \Inertia\Response
     */
    public function edit(Role $role)
    {
        $permissions = Permission::all();
        
        // Format role for the form
        $roleData = [
            'id' => $role->id,
            'name' => $role->name,
            'selectedPermissions' => $role->permissions->pluck('id')->toArray()
        ];
        
        return Inertia::render('Roles/Form', [
            'permissions' => $permissions,
            'isEditing' => true,
            'role' => $roleData
        ]);
    }

    /**
     * Update the specified role in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('roles')->ignore($role->id)
            ],
            'selectedPermissions' => ['required', 'array', 'min:1'],
            'selectedPermissions.*' => ['exists:permissions,id']
        ], [
            'selectedPermissions.required' => 'Please select at least one permission',
            'selectedPermissions.min' => 'Please select at least one permission'
        ]);
        
        DB::beginTransaction();
        
        try {
            // Update role
            $role->update(['name' => $validated['name']]);
            
            // Sync permissions
            $role->permissions()->sync($validated['selectedPermissions']);
            
            DB::commit();
            
            return redirect()->route('roles.index')
                ->with('success', 'Role updated successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem updating the role. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified role from storage.
     *
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Role $role)
    {
        if ($role->users()->count() > 0) {
            return back()->withErrors([
                'error' => 'This role cannot be deleted because it is assigned to users.'
            ]);
        }
        
        DB::beginTransaction();
        
        try {
            // Delete role permissions
            $role->permissions()->detach();
            
            // Delete role
            $role->delete();
            
            DB::commit();
            
            return redirect()->route('roles.index')
                ->with('success', 'Role deleted successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem deleting the role. ' . $e->getMessage()
            ]);
        }
    }
}