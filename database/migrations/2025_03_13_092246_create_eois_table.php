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
        Schema::create('eois', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('estimated_budget', 15, 2)->nullable();
            $table->date('submission_date');
            $table->string('status');
            $table->string('current_approval_step')->nullable();
            $table->unsignedBigInteger('approval_workflow_id')->nullable();
            $table->date('submission_deadline')->nullable();
            $table->text('evaluation_criteria')->nullable();
            $table->string('eoi_number')->unique();
            $table->boolean('allow_partial_item_submission')->default(false);
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            
            // Foreign key relationship for created_by (assuming users table)
            $table->foreign('created_by')->references('id')->on('users');
            
            // Foreign key relationship for approval_workflow_id (assuming approval_workflows table)
            // $table->foreign('approval_workflow_id')->references('id')->on('approval_workflows');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eois');
    }
};
