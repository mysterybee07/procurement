<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOwner
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        $vendor = $user->vendor;
        
        if (!$vendor) {
            abort(403, 'Unauthorized action.');
        }

        foreach ($request->route()->parameters() as $param) {
            if (is_object($param) && property_exists($param, 'vendor_id')) {
                if ($param->vendor_id !== $vendor->id) {
                    abort(403, 'Unauthorized action.');
                }
            }
        }
        
        return $next($request);
    }
}
