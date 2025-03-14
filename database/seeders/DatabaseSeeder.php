<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use DB;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Super Admin',
            'username'=>'superadmin123',
            'email' => 'admin@example.com',
            'password'=>'password123',
            'address'=>'abc xyz',
            'phone'=>'9840380475',
            'status'=>'active',
            // 'role_id'=>'1'
        ]);
        User::factory()->create([
            'name' => 'Seeded Vendor',
            'username'=>'vendor123',
            'email' => 'vendor@example.com',
            'password'=>'password123',
            'address'=>'abc xyz',
            'phone'=>'9840380476',
            'status'=>'active',
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
            'user_id' => 2,
            'in_contact_person' => 'Jane Smith',
        ]);
    }
}
