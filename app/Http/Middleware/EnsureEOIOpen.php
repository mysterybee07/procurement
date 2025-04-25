<?php

namespace App\Http\Middleware;

use App\Models\EOI;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEOIOpen
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $eoiId = $request->route('eoiId');
        // dd($eoiId); 
        $eoi = EOI::find($eoiId);
        // dd($eoi);

        if (!$eoi || $eoi->status !== "open") {
            return redirect()->back()->with('error', 'EOI is not open for submissions.');
        }

        return $next($request);
    }
}
