<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vendor_eoi_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_id');
            $table->unsignedBigInteger('vendor_id');
            $table->unsignedBigInteger('eoi_submission_id')->nullable();
            $table->string('file_path');
            $table->enum('status', [      
                'submitted',
                'accepted',
                'rejected'
            ])->default('submitted');            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_eoi_documents');
    }
};
