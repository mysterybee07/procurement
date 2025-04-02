<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use DB;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        // $this->call(RoleSeeder::class);
        // $this->call(PermissionSeeder::class);

        // $superAdmin = User::factory()->create([
        //     'name' => 'Super Admin',
        //     'username'=>'superadmin123',
        //     'email' => 'admin@example.com',
        //     'password'=>'password123',
        //     'address'=>'abc xyz',
        //     'phone'=>'9840380475',
        //     'status'=>'active',
        //     'is_super_admin'=>true,
        //     // 'role_id'=>'1'
        // ]);
        // $superAdmin->syncPermissions(Permission::all());


        // $superadmin->assignRole('superadmin');
        // OR Directly Assign All Permissions to the User
        //  $superadmin->syncPermissions(Permission::all());

        User::factory()->create([
            'name' => 'Admin',
            'username'=>'admin123',
            'email' => 'admin1@example.com',
            'password'=>'password123',
            'address'=>'abc xyz',
            'phone'=>'9840380476',
            'status'=>'active',
            // 'role_id'=>'1'
        ]);

        User::factory()->create([
            'name' => 'Normal Employee',
            'username'=>'employee123',
            'email' => 'employee@example.com',
            'password'=>'password123',
            'address'=>'abc xyz',
            'phone'=>'9840380480',
            'status'=>'active',
            // 'role_id'=>'1'
        ]);

        User::factory()->create([
            'name' => 'Seeded Vendor 1',
            'username'=>'vendor1',
            'email' => 'vendor1@example.com',
            'password'=>'password123',
            'address'=>'abc xyz',
            'phone'=>'9840380477',
            'status'=>'active',
            'is_vendor'=>true,
        ]);

        // Vendors::factory()->create([
        //     'vendor_name' => 'Tech Solutions',
        //     'registration_number' => 'REG-67890',
        //     'pan_number' => 'ABCDE5678G',
        //     'user_id' => 2,
        //     'in_contact_person' => 'Jane Smith',
        // ]);

        DB::table('vendors')->insert([
            'vendor_name' => 'Tech Solutions',
            'registration_number' => 'REG-67890',
            'pan_number' => 'ABCDE5678G',
            'user_id' => 3,
            'in_contact_person' => 'Jane',
        ]);

        User::factory()->create([
            'name' => 'Seeded Vendor 2',
            'username'=>'vendor2',
            'email' => 'vendor2@example.com',
            'password'=>'password123',
            'address'=>'abc xyz',
            'phone'=>'9840380478',
            'status'=>'active',
            'is_vendor'=>true,
        ]);

        DB::table('vendors')->insert([
            'vendor_name' => 'Tech Solutions 2',
            'registration_number' => 'REG-67891',
            'pan_number' => 'ABCDE5678H',
            'user_id' => 4,
            'in_contact_person' => 'Will Smith',
        ]);
        
        User::factory()->create([
            'name' => 'Seeded Vendor 3',
            'username'=>'vendor3',
            'email' => 'vendor3@example.com',
            'password'=>'password123',
            'address'=>'abc xyz',
            'phone'=>'9840380479',
            'status'=>'active',
            'is_vendor'=>true,
        ]);

        DB::table('vendors')->insert([
            'vendor_name' => 'Tech Solutions ',
            'registration_number' => 'REG-67892',
            'pan_number' => 'ABCDE5678I',
            'user_id' => 5,
            'in_contact_person' => 'Smith',
        ]);
    }
}
