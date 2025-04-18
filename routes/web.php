<?php

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\ApprovalWorkflowController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EOIController;
use App\Http\Controllers\EOIReportController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RequisitionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserRegisteredMailController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\VendorEOISubmissionController;
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

Route::get('/eois/public/{eoi}', [EOIController::class, 'publicEOIViews'])->name('eois.public.show');

Route::middleware(['auth','prevent.vendor'])->group(function () {
    // users route
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

    // categories route
    Route::get('/categories', [ProductCategoryController::class, 'index'])->name('categories.index');
    Route::get('/categories/create', [ProductCategoryController::class, 'create'])->name('categories.create');
    Route::post('/categories', [ProductCategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/{category}/edit', [ProductCategoryController::class, 'edit'])->name('categories.edit');
    Route::put('/categories/{category}', [ProductCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [ProductCategoryController::class, 'destroy'])->name('categories.destroy');

    // products
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    // Route::get('/eoi/{eoi_id}/products', [ProductController::class, 'getEOIProductsAndCategories'])->name('products.eoi-products');

    // requisitions route
    Route::get('/requisitions', [RequisitionController::class, 'index'])->name('requisitions.index');
    // Route::get('/requisitions', [RequisitionController::class, 'index'])->name('requisitions.userRequisition');
    Route::get('/requisitions/create', [RequisitionController::class, 'create'])->name('requisitions.create');
    Route::post('/requisitions', [RequisitionController::class, 'store'])->name('requisitions.store');
    Route::get('/requisitions/{requisition}/edit', [RequisitionController::class, 'edit'])->name('requisitions.edit');
    Route::get('/requisitions/{requisition}', [RequisitionController::class, 'show'])->name('requisitions.show');
    Route::put('/requisitions/{requisition}', [RequisitionController::class, 'update'])->name('requisitions.update');
    Route::delete('/requisitions/{requisition}', [RequisitionController::class, 'destroy'])->name('requisitions.destroy');
    Route::post('/requisitions/{requisition}/submit', [RequisitionController::class, 'submitRequisition'])->name('requisitions.submit');
    Route::post('/requisitions/{requestItem}/fulfill', [RequisitionController::class, 'fulfillRequisitionItem'])->name('requisitionsItem.fulfill');
    Route::post('/requisitions/{requestItem}/receive', [RequisitionController::class, 'receiveRequisitionItem'])->name('requisitionsItem.receive');

    // documents route
    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    // Route::get('/documents/create', [DocumentController::class, 'create'])->name('documents.create');
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    // Route::get('/documents/{document}/edit', [DocumentController::class, 'edit'])->name('documents.edit');
    // Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');
    Route::put('/documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
    Route::post('/document/{document}/approve', [DocumentController::class, 'approveDocument'])->name('document.approve');

    // vendor submitted documents
    Route::get('/submissions/{eoiSubmissionId}/documents', [DocumentController::class, 'show'])->name('eoiDocuments.show');


    // eois route
    Route::get('/eois', [EOIController::class, 'index'])->name('eois.index');
    Route::get('/eois/create', [EOIController::class, 'create'])->name('eois.create');
    Route::post('/eois', [EOIController::class, 'store'])->name('eois.store');
    Route::get('/eois/{eoi}', [EOIController::class, 'show'])->name('eois.show');
    Route::get('/eois/{eoi}/edit', [EOIController::class, 'edit'])->name('eois.edit');
    Route::put('/eois/{eoi}', [EOIController::class, 'update'])->name('eois.update');
    Route::delete('/eois/{eoi}', [EOIController::class, 'destroy'])->name('eois.destroy');
    Route::put('/eois/{eoi}/publish', [EOIController::class, 'publishEOI'])->name('eois.publish');
    Route::put('/eois/{eoi}/open', [EOIController::class, 'openEOI'])->name('eois.open');
    Route::put('/eois/{eoi}/close', [EOIController::class, 'closeEOI'])->name('eois.close');

    // eoi-submission route
    Route::get('/eoi-submission/{eoi}', [EOIController::class, 'listVendorSubmissionByEoi'])->name('eoisubmission.list');
    Route::get('/eoi-submission/{eoi}/details', [VendorEOISubmissionController::class, 'show'])->name('eoisubmission.details');
    Route::post('/eoi-submission/{eoi}/begin-selection', [EOIController::class, 'beginVendorSelection'])->name('eoisubmission.begin-selection');


    // roles route
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

    // approval workflows route
    Route::get('/approval-workflows', [ApprovalWorkflowController::class, 'index'])->name('approval-workflows.index');
    Route::get('/approval-workflows/create', [ApprovalWorkflowController::class, 'create'])->name('approval-workflow.create');
    Route::get('/approval-workflows/{workflow}', [ApprovalWorkflowController::class, 'show'])->name('approval-workflow.show');
    Route::post('/approval-workflows', [ApprovalWorkflowController::class, 'store'])->name('approval-workflows.store');
    Route::get('/approval-workflows/{workflow}/edit', [ApprovalWorkflowController::class, 'edit'])->name('approval-workflows.edit');
    Route::put('/approval-workflows/{workflow}', [ApprovalWorkflowController::class, 'update'])->name('approval-workflows.update');
    Route::delete('/approval-workflows/{workflow}', [ApprovalWorkflowController::class, 'destroy'])->name('approval-workflows.destroy');
    Route::post('/assign-approval-workflows/{entityType}/{entityId}', [ApprovalWorkflowController::class, 'assignWorkflow'])->name('approval-workflows.assign');
    Route::get('/approvals', [ApprovalController::class, 'approverDashboard'])->name('approval-workflows.dashboard');


    Route::put('/entity/{entityId}/approve',[ApprovalController::class,'approve'])->name('entity.approve');
    Route::put('/entity/{entityId}/reject',[ApprovalController::class,'reject'])->name('entity.reject');


    // EOI report
    Route::get('/reports/eoi', [EOIReportController::class, 'index'])->name('reports.eoi.index');
    Route::get('/reports/eoi/{eoi_id}', [EOIReportController::class, 'show'])->name('reports.eoi');
    Route::get('/reports/eoi/{eoi_id}/export', [EOIReportController::class, 'exportToExcel'])->name('reports.eoi.export');
    Route::get('/reports/eoi/{eoi_id}/print', [EOIReportController::class, 'printReport'])->name('reports.eoi.print');

    // Vendor route
    Route::get('/vendors',[VendorController::class, 'ListAllVendors'])->name('vendors.list');
    Route::get('/vendors/{vendor}',[VendorController::class, 'show'])->name('vendor.show');
    

    // mail
    Route::get('send-mail',[UserRegisteredMailController::class, 'UserRegisteredMail']);
    // Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    // // Route::get('/permissions/create', [PermissionController::class, 'create'])->name('permissions.create');
    // Route::post('/permissions', [PermissionController::class, 'store'])->name('permissions.store');
    // // Route::get('/permissions/{permission}/edit', [PermissionController::class, 'edit'])->name('permissions.edit');
    // Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
    // Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');
});


    // Vendor routes
    Route::middleware(['auth', 'ensure.vendor'])->group(function () {
            Route::get('/vendor/eois', [VendorController::class, 'EOIsForVendor'])->name('eois.vendor');
            Route::get('/vendor/submitted-eois', [VendorEOISubmissionController::class, 'index'])->name('vendoreois.index')->middleware('owner');
            Route::get('/vendor/eoi-submission/{eoi}/details', [VendorEOISubmissionController::class, 'show'])->name('eoisubmission.details');
    });
    // Route::middleware(['auth', 'ensure.vendor', 'owner'])->group(function () {
    // });
    Route::middleware(['auth'])->group(function () {
        Route::get('/vendor/eois/{eoi}', [EOIController::class, 'show'])->name('eois.show');
        // Route::get('/vendor/submitted-eois', [VendorEOISubmissionController::class, 'index'])->name('vendoreois.index');
        Route::get('/vendor/{eoiId}/submission', [VendorEOISubmissionController::class, 'create'])->middleware('isEOIOpen');
        Route::post('/vendor/{eoiId}/submission', [VendorEOISubmissionController::class, 'store']);
    });



    // Add this route in your 

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
