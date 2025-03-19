<?php

namespace App\Http\Controllers;

use App\Models\EOI;
use App\Models\Procurement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EOIController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('eoi/list-eois');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $procurement = Procurement::with('requestItems', 'requestItems.category', 'requester')->get();
        return Inertia::render('eoi/eoi-form');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(EOI $eOI)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EOI $eOI)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EOI $eOI)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EOI $eOI)
    {
        //
    }
}
