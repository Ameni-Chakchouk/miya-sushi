<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Menu Classique', 'slug' => 'menu', 'display_order' => 1],
            ['name' => 'Spécialités', 'slug' => 'specialty', 'display_order' => 2],
            ['name' => 'Nouveautés', 'slug' => 'new', 'display_order' => 3],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        }
    }
}
