<?php

namespace App\Http\Controllers;

use App\Models\User;
use DB;
use Dotenv\Exception\ValidationException;
use Hash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Str;
use Validator;
use function Termwind\render;

class UserController extends Controller implements HasMiddleware
{
    /**
     * Display a listing of the resource.
     */

     public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:view users', only: ['index']),
            new Middleware('permission:create users', only: ['create']),
            new Middleware('permission:edit users', only: ['edit']),
            new Middleware('permission:delete users', only: ['destroy']),
            new Middleware('permission:assign roles to users', only: ['assignPermissionsToRole']),
            new Middleware('permission:update user roles', only: ['updatePermissions']),
        ];
    }
    public function index()
    {
        // $user = User::whereDoesntHave('model_has_roles', function($query){
        //     $query->where('name', 'vendor');
        // })
        // ->get();
        // $users = DB::table('users')
        $users = User::with('roles')
        ->where(function ($query) {
            $query->where('is_vendor', false)  
                ->where('is_super_admin', false);
        })
        ->paginate(10);

    

            // dd($users);
        // dd($users);
        return Inertia::render('auth/user/list-users', [
            'users'=> $users,
            // 'users' => [
            //     'data' => $users->items(),
            //     'links' => $users->links()->elements,
            // ],
            'flash'=>[
                'message'=>session('message'),
                'error'=>session('error'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::all();
        
        return Inertia::render('auth/user/user-form', [
            'roles' => $roles,
            'isEditing' => false
        ]);
        // return Inertia::render('auth/user/user-form');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
    $requestData = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'address' => 'required|string|max:255',
        'phone' => 'required|string',
        'selectedRoles' => 'sometimes|array',
    ]);
    
    // dd($requestData);
    DB::beginTransaction();
    
    try {
        
        $baseUsername = explode('@', $requestData['email'])[0];
        $username = $baseUsername . rand(100, 999);
        
        
        $password = Str::random(10);
        $hashedPassword = Hash::make($password);
        
        // Create the user
        $user = User::create([
            'name' => $requestData['name'],
            'username' => $username,
            'address' => $requestData['address'],
            'phone' => $requestData['phone'],
            'email' => $requestData['email'],
            'password' => $hashedPassword,
        ]);
        
        // Handle roles if present
        if (isset($requestData['selectedRoles'])) {
            $user->roles()->attach($requestData['selectedRoles']);
        }
        
        DB::commit();
        return redirect()->route('users.index')->with('success', 'User created successfully!');
        
    } catch (\Exception $e) {
        DB::rollBack();
        // Return with error
        return back()->withErrors(['error' => 'Failed to create user: ' . $e->getMessage()]);
    }
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // $roles = Role::all();
        // $selectedRoles = $user->roles->pluck('id')->toArray();
        
        // return Inertia::render('Users/Edit', [
        //     'roles' => $roles,
        //     'user' => [
        //         'id' => $user->id,
        //         'name' => $user->name,
        //         'email' => $user->email,
        //         'address' => $user->address,
        //         'phone' => $user->phone,
        //         'selectedRoles' => $selectedRoles
        //     ],
        //     'isEditing' => true
        // ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function assignRoleToUser(User $user)
    {
        // Get all permissions
        $roles = Role::all();
        
        return Inertia::render('auth/user/assign-roles-to-user', [
            'roles' => $roles,
            'userId' => $user->id, 
            'selectedRoles' => $user->roles->pluck('id')->toArray(), 
        ]);
    }

    public function updateUserRoles(Request $request, User $user)
    {
        $request->validate([
            'selectedRoles' => 'array|exists:roles,id', 
        ]);
        // dd($request);
        
        // sync role of user
        $user->roles()->sync($request->selectedRoles);

        return redirect()->route('users.index')
            ->with('message', 'Role assigned successfully.');
    }
}
