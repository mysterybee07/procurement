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
        Schema::create('requisitions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            // $table->text('description')->nullable();
            $table->date('required_date');
            $table->unsignedBigInteger('requester');

            $table->enum('status', [
                'draft',        
                'submitted',    
                'pending_approval', 
                'approved',
                'provided',     
                'rejected',     
                'fulfilled',    
                'closed',       
                'canceled'      
            ])->default('draft');

            $table->string('urgency');
            $table->unsignedBigInteger('eoi_id')->nullable();
            $table->timestamps();

            $table->foreign('requester')->references('id')->on('users');
            $table->foreign('eoi_id')->references('id')->on('eois');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisitions');
    }
};
