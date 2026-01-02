<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminAuthController;

// Public Routes
Route::post('/signup', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Admin auth (separate from user login)
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'admin.only'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);

        // Place admin-only APIs here (e.g., verification queues)
        // Route::get('/verification-requests', ...);
    });
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Get logged-in user details
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
