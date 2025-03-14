<?php

namespace App\Http\Controllers;

use App\Http\Requests\PermissionRequest;
use App\Http\Requests\RoleRequest;
use Illuminate\Auth\Events\Validated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    /**
     * Display a listing of the roles.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $permissions = Permission::paginate(10); 
        
        return Inertia::render('auth/permission/list-permission', [
            'permissions' => [
                'data' => $permissions->items(),
                'links' => $permissions->links()->elements,
            ],
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new role.
     *
     * @return \Inertia\Response
     */
    public function create()
    {           
        return Inertia::render('auth/permission/permission-form');
    }

    /**
     * Store a newly created role in storage.
     */
    // public function store(RoleRequest $request)
    // {    
        // // dd($request->json());
        // $request->validate([
        //     'name' => 'required|string|unique:roles,name',
        //     'permissions' => 'required|array',
        //     'permissions.*' => 'exists:permissions,name',
        // ]);
        // dd($request);

    //     // Create the new role
    //     $role = Role::create(['name' => $request->validated('name')]);

    //     // Assign permissions to the role
    //     $role->givePermissionTo($request->permissions);
            
    //     return redirect()->route('roles.index')->with(
    //         'message', 'Role created successfully'
    //     );
    // }
    public function store(PermissionRequest $request)
    {
        DB::beginTransaction();
        
        try {
            
            $validated = $request->validated();
            
            // Create the new role
            Permission::create(['name' => $validated['name']]);
                        
            DB::commit();
            
            return redirect()->route('permissions.index')->with(
                'message', 'Permission created successfully'
            );
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem creating the permission. ' . $e->getMessage()
            ]);
        }
    }


    /**
     * Show the form for editing the specified role.
     *
     */
    public function edit(Permission $permission)
    {
      
        // Format permission for the form
        $permissionData = [
            'id' => $permission->id,
            'name' => $permission->name,
        ];
        
        return Inertia::render('auth/permission/permission-form', [
            'isEditing' => true,
            'permission' => $permissionData
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(PermissionRequest $request, Permission $permission)
    {
        DB::beginTransaction();
        
        try {
            // Get validated data from the request
            $validated = $request->validated();
            
            // Update permission name
            $permission->update(['name' => $validated['name']]);
                        
            DB::commit();
            
            return redirect()->route('permissions.index')
                ->with('success', 'Permission updated successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem updating the permission. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified role from storage.
     *
     */
    public function destroy(Permission $permission)
    {
        if ($permission->roles()->count() > 0) {
            return back()->withErrors([
                'error' => 'This permission cannot be deleted because it is assigned to roles.'
            ]);
        }
        
        DB::beginTransaction();
        
        try {
            // Delete permission permissions
            $permission->permissions()->detach();
            
            $permission->delete();
            
            DB::commit();
            
            return redirect()->route('permissions.index')
                ->with('success', 'Permission deleted successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem deleting the permi$permission. ' . $e->getMessage()
            ]);
        }
    }
}