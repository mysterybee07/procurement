<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vendor;
use DB;
use Dotenv\Exception\ValidationException;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Str;
use Validator;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $input = $request->all();
        DB::beginTransaction();

        try {
            // Default rules for normal users
            $rules = [
                'address' => ['required', 'string', 'max:255'],
                'phone' => ['required', 'string'], 
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            ];

            // validation for admin created users
            if (!isset($input['vendor_name']) && !isset($input['registration_number']) && !isset($input['pan_number'])) {
                $rules['name'] = ['required', 'string'];
            }

            // validation for vendors only field
            if (isset($input['vendor_name']) && isset($input['registration_number']) && isset($input['pan_number'])) {
                $rules = array_merge($rules, [
                    'vendor_name' => ['required', 'string', 'max:255'],
                    'registration_number' => ['required', 'numeric', 'digits:9'],
                    'pan_number' => ['required', 'numeric', 'digits:9'],
                ]);
            }

            // Validation
            Validator::make($input, $rules)->validate();

            // username auto generation
            $baseUsername = explode('@', $input['email'])[0];
            $username = $baseUsername . rand(100, 999);

            //password auto generation
            $password = Str::random(10);
            $hashedPassword = Hash::make($password);

            // Create the user with the appropriate role
            $user = User::create([
                'username' => $username,
                'address' => $input['address'],
                'phone' => $input['phone'],
                'email' => $input['email'],
                'password' => $hashedPassword,
            ]);

            // If it's a vendor registration, create the vendor details
            if (isset($input['vendor_name']) && isset($input['registration_number']) && isset($input['pan_number'])) {
                Vendor::create([
                    'user_id' => $user->id,
                    'vendor_name' => $input['vendor_name'],
                    'registration_number' => $input['registration_number'],
                    'pan_number' => $input['pan_number'],
                ]);
            }

            DB::commit();

            event(new Registered($user));

            Auth::login($user);

        } catch (\Exception $e) {
            DB::rollBack();

            throw new ValidationException($e);
        } 
        
        // Redirect to dashboard
        return to_route('dashboard');      
    }

}
