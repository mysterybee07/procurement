<?php

namespace App\Http\Controllers;

use App\Models\ApprovalWorkflow;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class ApprovalWorkflowController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('approval-workflow/list-approval-workflows');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::all();
        // dd($roles);
        return Inertia::render('approval-workflow/approval-workflow-form',[
            'roles'=>$roles,
        ]);
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
    public function show(ApprovalWorkflow $approvalWorkflow)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ApprovalWorkflow $approvalWorkflow)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ApprovalWorkflow $approvalWorkflow)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ApprovalWorkflow $approvalWorkflow)
    {
        //
    }
}
