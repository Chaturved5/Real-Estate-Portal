<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    public function test_admin_login_succeeds_for_admin_role(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role' => User::ROLE_ADMIN,
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'secret123',
        ]);

        $response->assertOk()->assertJsonStructure(['user', 'token']);
        $this->assertEquals($admin->id, $response->json('user.id'));
    }

    public function test_admin_login_rejects_non_admin(): void
    {
        User::factory()->create([
            'email' => 'buyer@example.com',
            'password' => Hash::make('secret123'),
            'role' => User::ROLE_BUYER,
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => 'buyer@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(422); // validation exception for invalid credentials
    }

    public function test_public_signup_cannot_create_admin(): void
    {
        $response = $this->postJson('/api/signup', [
            'name' => 'Hacker',
            'email' => 'hacker@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => User::ROLE_ADMIN,
        ]);

        $response->assertStatus(403);
    }
}
