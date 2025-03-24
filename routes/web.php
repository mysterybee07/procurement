<?php

use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EOIController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProcurementController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RequisitionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Models\Requisition;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::get('/users/{user}/role', [UserController::class, 'assignRoleToUser'])
    ->name('users.assignRoles');
    Route::put('/users/{user}/roles', [UserController::class, 'updateUserRoles'])
    ->name('users.updateRole');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/categories', [ProductCategoryController::class, 'index'])->name('categories.index');
    Route::get('/categories/create', [ProductCategoryController::class, 'create'])->name('categories.create');
    Route::post('/categories', [ProductCategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/{category}/edit', [ProductCategoryController::class, 'edit'])->name('categories.edit');
    Route::put('/categories/{category}', [ProductCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [ProductCategoryController::class, 'destroy'])->name('categories.destroy');
});
Route::middleware(['auth'])->group(function () {
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/requisitions', [RequisitionController::class, 'index'])->name('requisitions.index');
    // Route::get('/requisitions', [RequisitionController::class, 'index'])->name('requisitions.userRequisition');
    Route::get('/requisitions/create', [RequisitionController::class, 'create'])->name('requisitions.create');
    Route::post('/requisitions', [RequisitionController::class, 'store'])->name('requisitions.store');
    Route::get('/requisitions/{requisition}/edit', [RequisitionController::class, 'edit'])->name('requisitions.edit');
    Route::get('/requisitions/{requisition}', [RequisitionController::class, 'show'])->name('requisitions.show');
    Route::put('/requisitions/{requisition}', [RequisitionController::class, 'update'])->name('requisitions.update');
    Route::delete('/requisitions/{requisition}', [RequisitionController::class, 'destroy'])->name('requisitions.destroy');
});
Route::middleware(['auth'])->group(function () {
    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    // Route::get('/documents/create', [DocumentController::class, 'create'])->name('documents.create');
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    // Route::get('/documents/{document}/edit', [DocumentController::class, 'edit'])->name('documents.edit');
    // Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');
    Route::put('/documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/eois', [EOIController::class, 'index'])->name('eois.index');
    Route::get('/eois/create', [EOIController::class, 'create'])->name('eois.create');
    Route::post('/eois', [EOIController::class, 'store'])->name('eois.store');
    Route::get('/eois/{eoi}/edit', [EOIController::class, 'edit'])->name('eois.edit');
    Route::get('/eois/{eoi}', [EOIController::class, 'show'])->name('eois.show');
    Route::put('/eois/{eoi}', [EOIController::class, 'update'])->name('eois.update');
    Route::delete('/eois/{eoi}', [EOIController::class, 'destroy'])->name('eois.destroy');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    Route::get('/roles/{role}/permissions', [RoleController::class, 'assignPermissionsToRole'])
    ->name('roles.permissions');
    Route::put('/roles/{role}/permissions', [RoleController::class, 'updatePermissions'])
    ->name('roles.updatePermissions');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    // Route::get('/permissions/create', [PermissionController::class, 'create'])->name('permissions.create');
    Route::post('/permissions', [PermissionController::class, 'store'])->name('permissions.store');
    // Route::get('/permissions/{permission}/edit', [PermissionController::class, 'edit'])->name('permissions.edit');
    Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
