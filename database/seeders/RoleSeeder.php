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
        $superAdminRole = Role::create(['name'=>'superadmin']);
        Role::create(['name'=>'vendor']);
        Role::create(['name'=>'user']);

        $superAdminRole->syncPermissions(Permission::all());
    }
}
