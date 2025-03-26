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
        Schema::create('vendor_eoi_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('eoi_id');
            $table->unsignedBigInteger('vendor_id');
            $table->boolean('is_shortlisted')->default(false);
            $table->date('submission_date')->nullable();
            $$table->enum('status', [
                'draft',      
                'submitted', 
                'under_review',   
                'rejected',       
            ])->default('draft');
            $table->text('terms_and_conditions')->nullable();
            $table->date('delivery_date');
            $table->text('remarks')->nullable();
            // $table->string('current_approval_steps')->nullable();
            $table->decimal('items_total_price', 10, 2);
            $table->timestamps();

            $table->foreign('eoi_id')->references('id')->on('eois')->onDelete('cascade');
            $table->foreign('vendor_id')->references('id')->on('vendors')->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_eoi_submissions');
    }
};
