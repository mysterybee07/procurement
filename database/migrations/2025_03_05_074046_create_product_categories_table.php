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
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->string('category_name');
            $table->string('category_code')->unique();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('parent_category_id')->nullable();
            $table->timestamps();

            // Self-referencing foreign key
            $table->foreign('parent_category_id')
                  ->references('id')
                  ->on('product_categories')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};
