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
        Schema::create('request_approvals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('entity_id');
            $table->string('entity_type');
            $table->string('status');
            $table->text('comments')->nullable();
            $table->timestamp('action_date')->nullable();
            $table->unsignedBigInteger('approval_step_id')->nullable();
            $table->unsignedBigInteger('delegate_to')->nullable();
            $table->unsignedBigInteger('approver_id')->nullable();
            $table->timestamps();

            $table->foreign('approval_step_id')->references('id')->on('approval_steps');
            $table->foreign('delegate_to')->references('id')->on('users');
            $table->foreign('approver_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_approvals');
    }
};
