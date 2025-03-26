<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HandleVendorAccess
{
    public function handle($request, Closure $next)
    {
        $user = Auth::user();
        // If user is a vendor, prevent access to organizational routes
        if ($user && $user->is_vendor) {
            // Redirect or return a forbidden response
            return Inertia::render('403', [
                'message' => 'You do not have permission to access this resource.'
            ])->with(403);
        }
        return $next($request);
    }
}