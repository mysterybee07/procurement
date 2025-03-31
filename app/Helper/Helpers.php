<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

if (!function_exists('handleFileUpload')) {
    function handleFileUpload(Request $request, $fileKey, $basePath, $eoiId)
    {
        if ($request->hasFile($fileKey)) {
            $file = $request->file($fileKey);
            if ($file->isValid()) {
                $storagePath = "$basePath/eoi-$eoiId";
                return $file->store($storagePath, 'public');
            }
        }
        return null;
    }

}

