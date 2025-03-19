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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('in_stock_quantity');
            $table->string('unit');
            // $table->decimal('estimated_unit_price', 10, 2);
            $table->text('specifications');
            $table->unsignedBigInteger('category_id');                       
            $table->timestamps();            
            $table->foreign('category_id')->references(columns: 'id')->on('product_categories')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
