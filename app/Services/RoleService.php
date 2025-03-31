<?php

namespace App\Services;

use App\Repositories\Interfaces\RoleInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleService
{
    protected $roleRepository;

    public function __construct(RoleInterface $roleRepository)
    {
        $this->roleRepository = $roleRepository;
    }

    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->roleRepository->getAllPaginated($perPage);
    }

    public function getAllPermissions(): array
    {
        return Permission::all()->toArray();
    }

    public function getById(int $id): ?Role
    {
        return $this->roleRepository->getById($id);
    }

    public function create(array $validatedData): Role
    {
        return $this->roleRepository->create($validatedData);
    }

    public function update(Role $role, array $validatedData): bool
    {
        return $this->roleRepository->update($role, $validatedData);
    }

    public function delete(Role $role): bool
    {
        // Check if role has users before deletion
        if ($this->roleRepository->hasUsers($role)) {
            throw new \Exception('This role cannot be deleted because it is assigned to users.');
        }
        
        return $this->roleRepository->delete($role);
    }

    public function assignPermissions(Role $role, array $permissionIds): bool
    {
        return $this->roleRepository->assignPermissions($role, $permissionIds);
    }

    public function prepareRoleForForm(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'selectedPermissions' => $role->permissions->pluck('id')->toArray()
        ];
    }
}