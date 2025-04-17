<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vendor;
use App\Notifications\UserRegistrationNortification;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Mail;
use Spatie\Permission\Models\Role;
use Str;
use App\Mail\UserRegisteredMail;
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
 
    //  Vendor and user Registration
    public function store(Request $request)
    {
        $input = $request->all();
        
        $rules = [
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
        ];

        if (!isset($input['vendor_name']) && !isset($input['registration_number']) && !isset($input['pan_number'])) {
            $rules['name'] = ['required', 'string'];
        }

        $isVendorRegistration = isset($input['vendor_name']) 
            && isset($input['registration_number']) 
            && isset($input['pan_number']);

        if ($isVendorRegistration) {
            $rules = array_merge($rules, [
                'vendor_name' => ['required', 'string', 'max:255'],
                'registration_number' => ['required', 'string', 'max:20'],
                'pan_number' => ['required', 'string', 'max:20'],
            ]);
        }

        $validator = Validator::make($input, $rules);
        $validator->validate();

        DB::beginTransaction();

        try {
            $baseUsername = explode('@', $input['email'])[0];
            $username = $baseUsername . rand(100, 999);
            $password = Str::random(10);
            $hashedPassword = Hash::make($password);

            $user = User::create([
                'name' => $input['name'] ?? null,
                'username' => $username,
                'address' => $input['address'],
                'phone' => $input['phone'],
                'email' => $input['email'],
                'password' => $hashedPassword,
                'is_vendor' => $isVendorRegistration, 
            ]);

            if ($isVendorRegistration) {
                Vendor::create([
                    'user_id' => $user->id,
                    'vendor_name' => $input['vendor_name'],
                    'registration_number' => $input['registration_number'],
                    'pan_number' => $input['pan_number'],
                ]);
            }

            DB::commit();

            // Send email after successful commit
            try {
                Mail::to($user->email)->send(new UserRegisteredMail($username, $password));
                
                // Redirect vendors to login, non-vendors to users.index
                return $isVendorRegistration 
                    ? redirect('/login')->with('message', 'Vendor registered successfully')
                    : redirect()->route('users.index')->with('message', 'User registered successfully');
                    
            } catch (\Exception $e) {
                \Log::error('Mail send failed: '.$e->getMessage());
                return $isVendorRegistration
                    ? redirect('/login')
                        ->with('message', 'Vendor registered but email failed')
                        ->with('error', 'Failed to send email: '.$e->getMessage())
                    : redirect()->route('users.index')
                        ->with('message', 'User registered but email failed')
                        ->with('error', 'Failed to send email: '.$e->getMessage());
            }

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Registration failed: '.$e->getMessage());
            return back()->with('error', 'Registration failed: '.$e->getMessage());
        }
    }
}
