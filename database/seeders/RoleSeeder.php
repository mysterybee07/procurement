<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $createUserPermission = Permission::create(['name' => 'create users']);

        $superAdminRole = Role::create(['name'=>'superadmin']);
        Role::create(['name'=>'vendor']);
        Role::create(['name'=>'user']);

        $superAdminRole -> givePermissionTo($createUserPermission);

        $user = User::find(1);

        $user ->assignRole($superAdminRole);
    }
}
