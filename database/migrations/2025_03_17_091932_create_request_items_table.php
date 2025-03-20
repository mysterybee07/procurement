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
        Schema::create('request_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('procurement_id');
            $table->unsignedBigInteger('product_id');
            $table->integer('required_quantity');
            $table->text('additional_specifications')->nullable();
                       
            $table->timestamps();
            
            $table->foreign('procurement_id')->references(columns: 'id')->on('procurements')->onDelete('cascade');
            $table->foreign('product_id')->references(columns: 'id')->on('products')->onDelete('cascade');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_items');
    }
};
