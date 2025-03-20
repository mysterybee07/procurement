<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentRequest;
use App\Models\Document;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $documents = Document::paginate(10); 
        
        return Inertia::render('document/list-documents', [
            'documents' => [
                'data' => $documents->items(),
                'links' => $documents->links()->elements,
            ],
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DocumentRequest $request)
    {
        DB::beginTransaction();
        
        try {
            
            $data = $request->validated();
            
            // Create the new role
            Document::create(['name' => $data['name']]);
                        
            DB::commit();
            
            return redirect()->back()->with(
                'message', 'Document created successfully'
            );
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem creating the document. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Document $document)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Document $document)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DocumentRequest $request, Document $document)
    {
        DB::beginTransaction();
        
        try {
            // Get validated data from the request
            $requestData = $request->validated();
            
            // Update permission name
            $document->update(['name' => $requestData['name']]);
                        
            DB::commit();
            
            return redirect()->back()
                ->with('message', 'Document updated successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'There was a problem updating the document. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Document $document)
    {
        // dd($document);
        $document->delete();
        return redirect()->route('documents.index')->with(
            'message', "Document Deleted successfully",
        );
    }
}
