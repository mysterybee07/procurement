<?php

namespace App\Repositories\Interfaces;

use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

interface RoleInterface
{
    public function getAllPaginated(int $perPage): LengthAwarePaginator;
    public function getById(int $id): ?Role;
    public function create(array $data): Role;
    public function update(Role $role, array $data): bool;
    public function delete(Role $role): bool;
    public function assignPermissions(Role $role, array $permissionIds): bool;
    public function hasUsers(Role $role): bool;
}