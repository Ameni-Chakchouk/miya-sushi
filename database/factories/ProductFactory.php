<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'name' => fake()->unique()->words(3, true),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 5, 25),
            'image_url' => fake()->imageUrl(600, 400, 'food'),
            'image_path' => null,
            'is_new' => fake()->boolean(20),
            'is_available' => true,
            'display_order' => fake()->numberBetween(1, 20),
        ];
    }
}
