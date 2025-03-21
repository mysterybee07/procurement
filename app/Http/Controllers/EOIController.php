<?php

namespace App\Http\Controllers;

use App\Http\Requests\EOIRequest;
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
        $eois = EOI::with( 'createdBy', 'requisitions.requestItems.product')->paginate(10);
        // dd($eois);

        return Inertia::render('eoi/list-eois',[
            'eois'=>$eois,
            'flash'=>[
                'message'=>session('message'),
                'error'=>session('error'),
            ]
        ]);
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
    public function store(EOIRequest $request)
    {

        // dd($request);
        
        $requestData= $request->validated();

        // dd($requestData);

        // if ($requestData->fails()) {
        //     return redirect()->back()->withErrors($requestData)->withInput();
        // }
              
        $eoiNumber = 'EOI-' . date('Y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);

        // Create the EOI
        $eoi = EOI::create([
            'title' => $requestData['title'],
            'description' => $requestData['description'],
            'submission_date' => $requestData['submission_date'],
            'submission_deadline' => $requestData['submission_deadline'],
            'evaluation_criteria' => $requestData['evaluation_criteria'],
            'allow_partial_item_submission' => $requestData['allow_partial_item_submission'] ?? false,
            // 'approval_workflow_id' => $requestData['approval_workflow_id'],
            'status' => $requestData['status'] ?? 'draft',
            'eoi_number' => $eoiNumber,
            'created_by' => auth()->id(),
        ]);
        // $documents = Document::all();

        if (!empty($requestData['documents'] ?? null)) {
            $eoi->documents()->sync($requestData['documents']);
        }        

        // Update eoi id on procurement table
        if ($requestData['procurement_ids']&& !empty($requestData->procurement_ids)) {
            Procurement::whereIn('id', $requestData->procurement_ids)
            ->update(['eoi_id' => $eoi->id]);
        }

        return redirect()->route('eois.index', $eoi->id)
        ->with('message', 'Expression of Interest created successfully.');
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
