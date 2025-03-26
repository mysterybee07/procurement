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
        Schema::create('vendor_submitted_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vendor_eoi_submission_id');
            $table->decimal('actual_unit_price', 10, 2);
            $table->unsignedBigInteger('request_items_id');
            $table->decimal('actual_product_total_price', 10, 2);
            $table->decimal('discount_rate', 5, 2)->nullable();

            $table->timestamps();

            $table->foreign('vendor_eoi_submission_id')->references('id')->on('vendor_eoi_submissions')->onDelete('cascade');
            $table->foreign('request_items_id')->references('id')->on('request_items')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_submitted_items');
    }
};
