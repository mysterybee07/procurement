<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use App\Services\RoleService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller implements HasMiddleware
{
    protected $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }
    
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
        $roles = $this->roleService->getAllPaginated();
        
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
    public function store(RoleRequest $request)
    {
        try {
            $this->roleService->create($request->validated());
            
            return redirect()->route('roles.index')->with(
                'message', 'Role created successfully'
            );
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'There was a problem creating the role. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role)
    {
        $permissions = Permission::all();
        $roleData = $this->roleService->prepareRoleForForm($role);
        
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
        try {
            $this->roleService->update($role, $request->validated());
            
            return redirect()->route('roles.index')
                ->with('message', 'Role updated successfully.');
                
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'There was a problem updating the role. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show form to assign permissions to a role.
     */
    public function assignPermissionsToRole(Role $role)
    {
        $permissions = Permission::all();
        
        return Inertia::render('auth/role/assign-permissions-to-role', [
            'permissions' => $permissions,
            'roleId' => $role->id, 
            'selectedPermissions' => $role->permissions->pluck('id')->toArray(), 
        ]);
    }

    /**
     * Update permissions for a role.
     */
    public function updatePermissions(Request $request, Role $role)
    {
        $request->validate([
            'selectedPermissions' => 'array|exists:permissions,id', 
        ]);
        
        try {
            $this->roleService->assignPermissions($role, $request->selectedPermissions);
            
            return redirect()->route('roles.index')
                ->with('message', 'Permissions assigned successfully.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'There was a problem assigning permissions. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role)
    {
        try {
            $this->roleService->delete($role);
            
            return redirect()->route('roles.index')
                ->with('message', 'Role deleted successfully.');
                
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => $e->getMessage()
            ]);
        }
    }
}