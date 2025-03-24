<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use Illuminate\Auth\Events\Validated;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller implements HasMiddleware
// class RoleController extends Controller 
{

    
    public static function middleware(): array
    {
        return [
            new Middleware('permission:view roles', only: ['index']),
            new Middleware('permission:create roles', only: ['create']),
            new Middleware('permission:edit roles', only: ['edit']),
            new Middleware('permission:delete roles', only: ['destroy']),
            new Middleware('permission:assign permissions to roles', only: ['assignPermissionsToRole']),
            new Middleware('permission:update role permissions', only: ['updatePermissions']),
        ];
    }
    /**
     * Display a listing of the roles.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $roles = Role::with('permissions')->paginate(10); 
        
        return Inertia::render('auth/role/list-role', [
            'roles' => [
                'data' => $roles->items(),
                'links' => $roles->links()->elements,
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
        $permissions = Permission::all();
        
        return Inertia::render('auth/role/role-form', [
            'permissions' => $permissions,
            'isEditing' => false
        ]);
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
    public function store(RoleRequest $request)
    {
        // dd($request->json());
        // $request->validate([
        //     'name' => 'required|string|unique:roles,name',
        //     'permissions' => 'required|array',
        //     'permissions.*' => 'exists:permissions,name',
        // ]);
        // dd($request);
        DB::beginTransaction();
        
        try {
            
            $requestData = $request->validated();
            
            // Create the new role
            $role = Role::create(['name' => $requestData['name']]);
            
            // Assign permissions to the role
            $role->givePermissionTo($requestData['selectedPermissions']);

            // dd($role);
            
            DB::commit();
            
            return redirect()->route('roles.index')->with(
                'message', 'Role created successfully'
            );
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
        
        return Inertia::render('auth/role/role-form', [
            'permissions' => $permissions,
            'isEditing' => true,
            'role' => $roleData,
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(RoleRequest $request, Role $role)
    {
        DB::beginTransaction();
        
        try {
            // Get validated data from the request
            $requestData = $request->validated();
            
            // Update role name
            $role->update(['name' => $requestData['name']]);
            
            //selected permissions
            $role->permissions()->sync($requestData['selectedPermissions']);
            
            DB::commit();
            
            return redirect()->route('roles.index')
                ->with('message', 'Role updated successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem updating the role. ' . $e->getMessage()
            ]);
        }
    }

    public function assignPermissionsToRole(Role $role)
    {
        // Get all permissions
        $permissions = Permission::all();
        
        return Inertia::render('auth/role/assign-permissions-to-role', [
            'permissions' => $permissions,
            'roleId' => $role->id, 
            'selectedPermissions' => $role->permissions->pluck('id')->toArray(), 
        ]);
    }

    public function updatePermissions(Request $request, Role $role)
    {
        $request->validate([
            'selectedPermissions' => 'array|exists:permissions,id', 
        ]);
        
        // Sync the permissions to the role
        $role->permissions()->sync($request->selectedPermissions);

        return redirect()->route('roles.index')
            ->with('message', 'Permissions assigned successfully.');
    }

    /**
     * Remove the specified role from storage.
     *
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
                ->with('message', 'Role deleted successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem deleting the role. ' . $e->getMessage()
            ]);
        }
    }
}