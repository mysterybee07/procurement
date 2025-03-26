<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EnsureVendorAccess
{
    public function handle($request, Closure $next)
    {
        $user = Auth::user();

        // Allow access only if the user is a vendor
        if (!$user || !$user->is_vendor) {
            return Inertia::render('error/403', [
                'message' => 'You donot have permission to access this resource.'
            ])->with(403);
        }

        return $next($request);
    }
}
