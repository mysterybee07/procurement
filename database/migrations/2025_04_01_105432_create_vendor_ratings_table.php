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
        Schema::create('vendor_ratings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vendor_eoi_submission_id');
            $table->unsignedBigInteger('vendor_id');
            $table->unsignedBigInteger('eoi_id');
            $table->decimal('total_pricing_score', 8, 2);      
            $table->decimal('delivery_date_score', 8, 2);      
            $table->decimal('submission_completeness_score', 8, 2); 
            $table->decimal('document_score', 8, 2);           
            $table->decimal('past_performance_score', 8, 2);   
            $table->decimal('overall_rating', 8, 2);           
            $table->timestamps();       
           
            $table->foreign('vendor_eoi_submission_id')->references('id')->on('vendor_eoi_submissions')->onDelete('cascade');
            $table->foreign('vendor_id')->references('id')->on('vendors')->onDelete('cascade');
            $table->foreign('eoi_id')->references('id')->on('eois')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_ratings');
    }
};
