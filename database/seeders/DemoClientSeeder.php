<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoClientSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'client@gmail.com'],
            [
                'name' => 'Client Démo',
                'role' => UserRole::CLIENT,
                'phone' => '0611111111',
                'address' => '12 rue Exemple, Paris',
                'password' => '12345678',
            ],
        );
    }
}
