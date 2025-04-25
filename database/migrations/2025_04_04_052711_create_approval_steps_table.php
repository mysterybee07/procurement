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
        Schema::create('approval_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('approval_workflow_id');
            $table->string('approver_role');
            $table->boolean('is_mandatory')->default(true);
            $table->integer('step_number');
            $table->boolean('allow_delegation')->default(false);
            $table->string('step_name');
            $table->timestamps();

            $table->foreign('approval_workflow_id')->references('id')->on('approval_workflows')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_steps');
    }
};
