<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrateur',
                'role' => UserRole::ADMIN,
                'phone' => '0600000000',
                'address' => null,
                'password' => '123',
            ],
        );
    }
}
