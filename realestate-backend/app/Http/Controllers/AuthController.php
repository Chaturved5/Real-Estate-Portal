<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    // ============================
    // REGISTER / SIGNUP
    // ============================
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|confirmed|min:6',
            'role' => 'required|string'
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => Hash::make($fields['password']),
            'role' => $fields['role'],
        ]);

        $token = $user->createToken('token')->plainTextToken;

        return response([
            'message' => 'User created successfully',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // ============================
    // LOGIN
    // ============================
    public function login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $fields['email'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('token')->plainTextToken;

        return response([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ], 200);
    }

    // ============================
    // LOGOUT
    // ============================
    public function logout(Request $request)
    {
        auth()->user()->tokens()->delete();

        return [
            'message' => 'Logged out'
        ];
    }
}
