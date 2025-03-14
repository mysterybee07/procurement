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
        Schema::create('product_vendor_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_categories_id');
            $table->unsignedBigInteger('vendor_id');
            $table->timestamps();

            $table->foreign('product_categories_id')->references('id')->on('product_categories');
            $table->foreign('vendor_id')->references('id')->on('vendors');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_vendor_categories');
    }
};
