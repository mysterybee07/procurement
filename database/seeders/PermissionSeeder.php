<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',
            'assign roles to users',
            'update user roles',

            // Product Category management
            'view categories',
            'create categories',
            'edit categories',
            'delete categories',

            // Product management
            'view products',
            'create products',
            'edit products',
            'delete products',

            // Requisition management
            'view requisitions',
            'create requisitions',
            'edit requisitions',
            'delete requisitions',
            'show requisitions',
            'fulfill requisitionItem',

            // Document management
            'view documents',
            'create documents',
            'edit documents',
            'delete documents',

            // EOI management
            'view eois',
            'create eois',
            'edit eois',
            'delete eois',
            'show eois',
            'publish eois',

            // Role management
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'assign permissions to roles',
            'update role permissions',

            // approval workflows
            'view approval workflows',
            'create approval workflows',
            'edit approval workflows',
            'delete approval workflows',
            'assign workflows',

            // approvals

            'view approvals',
            'approve and reject requests'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }
    }
}
