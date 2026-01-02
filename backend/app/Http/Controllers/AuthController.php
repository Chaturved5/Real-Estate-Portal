<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class AuthController extends Controller
{
    // ============================
    // REGISTER / SIGNUP
    // ============================
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', 'min:6'],
            'role' => ['nullable', 'string'],
        ]);

        $role = Str::of($data['role'] ?? User::ROLE_BUYER)->lower()->value();
        if ($role === 'broker') {
            $role = User::ROLE_AGENT; // compatibility
        }

        // Public signup cannot create admins
        if ($role === User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'Admin accounts cannot be created via public signup.',
            ], 403);
        }

        $allowedRoles = [User::ROLE_OWNER, User::ROLE_AGENT, User::ROLE_BUYER];
        if (! in_array($role, $allowedRoles, true)) {
            return response()->json([
                'message' => 'Invalid role provided.',
                'allowed_roles' => $allowedRoles,
            ], 422);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $role,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    // ============================
    // LOGIN
    // ============================
    public function login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $fields['email'])->first();

        if (! $user || ! Hash::check($fields['password'], $user->password)) {
            return response([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    // ============================
    // LOGOUT
    // ============================
    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response([
                'message' => 'Not authenticated'
            ], 401);
        }

        // Remove only the current token so other sessions stay valid.
        $user->currentAccessToken()?->delete();

        return [
            'message' => 'Logged out'
        ];
    }
}
