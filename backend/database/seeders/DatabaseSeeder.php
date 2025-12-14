<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin Portal',
                'email' => 'admin@estateportal.com',
                'role' => 'admin',
                'password' => 'Admin@123',
            ],
            [
                'name' => 'Owner One',
                'email' => 'owner@estateportal.com',
                'role' => 'owner',
                'password' => 'Owner@123',
            ],
            [
                'name' => 'Broker Ally',
                'email' => 'broker@estateportal.com',
                'role' => 'broker',
                'password' => 'Broker@123',
            ],
            [
                'name' => 'Buyer Prime',
                'email' => 'buyer@estateportal.com',
                'role' => 'buyer',
                'password' => 'Buyer@123',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'role' => $userData['role'],
                    'password' => Hash::make($userData['password']),
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
