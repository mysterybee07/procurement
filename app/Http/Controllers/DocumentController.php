<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentRequest;
use App\Models\Document;
use App\Models\VendorEOIDocument;
use DB;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Log;

class DocumentController extends Controller implements HasMiddleware
{
    /**
     * Display a listing of the resource.
     */

     public static function middleware(): array
    {
        return [
            new Middleware('permission:view documents', only: ['index']),
            new Middleware('permission:create documents', only: ['create']),
            new Middleware('permission:edit documents', only: ['edit']),
            new Middleware('permission:delete documents', only: ['destroy']),
            // new Middleware('permission:assign permissions to documents', only: ['assignPermissionsToRole']),
            // new Middleware('permission:update role permissions', only: ['updatePermissions']),
        ];
    }
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
            
            // Create the new document and get the instance
            $document = Document::create(['name' => $data['name']]);
                        
            DB::commit();
            
            // Return with the created document directly as part of the Inertia props
            return back()
                ->with('message', 'Document created successfully')
                ->with('createdDocument', [
                    'id' => $document->id,
                    'name' => $document->name
                ]);
                
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
    public function show($eoiSubmissionId)
    {
        $documents = VendorEOIDocument::with('vendor', 'document')
            ->where('eoi_submission_id', $eoiSubmissionId)
            ->get();
    
        return Inertia::render('document/list-vendor-submitted-documents', [
            'documents' => $documents,
            'eoiSubmissionId' => $eoiSubmissionId,
            'flash'=>[
                'message'=> session('message'),
                'error'=>session('error'),
            ]
        ]);
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


    public function approveDocument($docId)
    {
        try {
            $document = VendorEOIDocument::findOrFail($docId);
            $document->status = 'accepted';
            $document->save();
            // dd($document);
            return redirect()->back()
                ->with('message', 'Document approved successfully');
        } catch (\Exception $e) {
            Log::error('Error approving document: ' . $e->getMessage());
            
            return redirect()->back()
                ->with('error', 'Failed to approve document. Please try again.');
        }
    }
}
