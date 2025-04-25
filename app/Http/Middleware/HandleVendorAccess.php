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
        // preventing access to organizational routes for vendor
        if ($user && $user->is_vendor) {
            return Inertia::render('error/403', [
                'message' => 'You do not have permission to access this resource.'
            ])->with(403);
        }
        return $next($request);
    }
}