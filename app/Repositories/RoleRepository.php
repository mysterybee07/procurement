<?php

namespace App\Repositories;

use App\Repositories\Interfaces\RoleInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class RoleRepository implements RoleInterface
{
    public function getAllPaginated(int $perPage): LengthAwarePaginator
    {
        return Role::with('permissions')->paginate($perPage);
    }

    public function getById(int $id): ?Role
    {
        return Role::with('permissions')->findOrFail($id);
    }

    public function create(array $data): Role
    {
        try {
            DB::beginTransaction();
            
            // Create the role
            $role = Role::create(['name' => $data['name']]);
            
            // Assign permissions if provided
            if (isset($data['selectedPermissions']) && is_array($data['selectedPermissions'])) {
                $role->permissions()->sync($data['selectedPermissions']);
            }
            
            DB::commit();
            return $role;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function update(Role $role, array $data): bool
    {
        try {
            DB::beginTransaction();
            
            // Update role name
            $role->update(['name' => $data['name']]);
            
            // Update permissions if provided
            if (isset($data['selectedPermissions']) && is_array($data['selectedPermissions'])) {
                $role->permissions()->sync($data['selectedPermissions']);
            }
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete(Role $role): bool
    {
        try {
            DB::beginTransaction();
            
            // Delete role permissions
            $role->permissions()->detach();
            
            // Delete role
            $role->delete();
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function assignPermissions(Role $role, array $permissionIds): bool
    {
        try {
            DB::beginTransaction();
            
            // Sync the permissions to the role
            $role->permissions()->sync($permissionIds);
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function hasUsers(Role $role): bool
    {
        return $role->users()->count() > 0;
    }
}