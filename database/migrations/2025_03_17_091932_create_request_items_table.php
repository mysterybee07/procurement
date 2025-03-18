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
            $table->string('name');
            $table->integer('quantity');
            $table->string('unit');
            $table->decimal('estimated_unit_price', 10, 2);
            $table->text('core_specifications');
            $table->unsignedBigInteger('category_id');
                       
            $table->timestamps();
            
            $table->foreign('procurement_id')->references(columns: 'id')->on('procurements')->onDelete('cascade');
            $table->foreign('category_id')->references(columns: 'id')->on('product_categories')->onDelete('cascade');
            
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
