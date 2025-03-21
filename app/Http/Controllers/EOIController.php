<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\EOI;
use App\Models\Procurement;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Validator;

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
    public function create(Request $request)
    {
        $procurements = [];
        $products = Product::all();
        $requiredDocuments = Document::all();

        if ($request->has('procurement_ids') && !empty($request->procurement_ids)) {
            $procurementIds = $request->procurement_ids;
            $procurements = Procurement::whereIn('id', $procurementIds)->get();
        }

        return Inertia::render('eoi/eoi-form', [
            'products'=>$products,
            'procurements' => $procurements,
            'requiredDocuments'=>$requiredDocuments
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        // dd($request);
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'submission_date' => 'required|date',
            'submission_deadline' => 'nullable|date',
            'evaluation_criteria' => 'nullable|string',
            'allow_partial_item_submission' => 'boolean',
            // 'approval_workflow_id' => 'nullable|exists:approval_workflows,id',
            'documents' => 'nullable|array',
            'documents.*' => 'exists:documents,id',
            'procurement_ids'=>'nullable | array',
            'procurement_ids.*' => 'exists:procurements,id',
        ]);
        // dd($validator);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
              
        $eoiNumber = 'EOI-' . date('Y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);

        // Create the EOI
        $eoi = EOI::create([
            'title' => $request->title,
            'description' => $request->description,
            'submission_date' => $request->submission_date,
            'submission_deadline' => $request->submission_deadline,
            'evaluation_criteria' => $request->evaluation_criteria,
            'allow_partial_item_submission' => $request->allow_partial_item_submission ?? false,
            'approval_workflow_id' => $request->approval_workflow_id,
            'status' => $request->status ?? 'draft',
            'eoi_number' => $eoiNumber,
            'created_by' => auth()->id(),
        ]);
        // $documents = Document::all();

        if ($request->has('documents') && !empty($request->documents)) {
            $eoi->documents()->sync($request->documents);
        }
        if ($request->has('procurement_ids') && !empty($request->procurement_ids)) {
            $eoi->requisitions()->sync($request->procurement_ids);
        }

        return redirect()->route('eois.index', $eoi->id)->with('success', 'Expression of Interest created successfully.');
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
