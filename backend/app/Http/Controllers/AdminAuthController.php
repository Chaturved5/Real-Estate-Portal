<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = strtolower((string) $request->input('email'));
        $key = 'admin-login:' . $request->ip() . ':' . $email;

        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages([
                'email' => ['Too many attempts. Please try again later.'],
            ]);
        }

        $user = User::where('email', $email)->first();

        $invalid = ! $user
            || $user->role !== User::ROLE_ADMIN
            || ! Hash::check((string) $request->input('password'), (string) $user->password);

        if ($invalid) {
            RateLimiter::hit($key, 60);

            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        RateLimiter::clear($key);

        // Issue a Sanctum token with admin-only ability
        $token = $user->createToken('admin', ['admin'])->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['ok' => true]);
    }
}
