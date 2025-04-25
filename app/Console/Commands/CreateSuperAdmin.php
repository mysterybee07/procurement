<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:superadmin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a Super Admin User';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating a Super Admin...');

        $name = $this->ask('Enter the Super Admin name');
        $username = $this->ask('Enter the username');
        $address = $this->ask('Enter the address');
        $phone = $this->ask('Enter the phone number');
        $email = $this->ask('Enter the Super Admin email');

        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email format.');
            return;
        }

        $password = $this->secret('Enter the password');
        $confirmPassword = $this->secret('Confirm the password');

        if ($password !== $confirmPassword) {
            $this->error('Passwords do not match.');
            return;
        }

        // Check if the user already exists
        if (User::where('email', $email)->orWhere('username', $username)->exists()) {
            $this->error('A user with this email or username already exists.');
            return;
        }

        // Create Super Admin user
        $user = User::create([
            'name' => $name,
            'username' => $username,
            'address' => $address,
            'phone' => $phone,
            'email' => $email,
            'password' => Hash::make($password),
            'is_vendor' => false,
            'is_super_admin' => true
        ]);

        $this->info('Super Admin created successfully!');
    }
}
