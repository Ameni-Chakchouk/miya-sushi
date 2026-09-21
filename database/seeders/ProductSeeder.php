<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::query()->get()->keyBy('slug');

        $products = [
            [
                'category' => 'menu',
                'name' => 'California Roll',
                'description' => 'Avocat crémeux, surimi frais, concombre croquant et graines de sésame',
                'price' => 8.50,
                'image_url' => 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80',
                'is_new' => false,
                'display_order' => 1,
            ],
            [
                'category' => 'menu',
                'name' => 'Salmon Nigiri',
                'description' => 'Saumon écossais premium sur riz vinaigré artisanal',
                'price' => 6.00,
                'image_url' => 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&q=80',
                'is_new' => false,
                'display_order' => 2,
            ],
            [
                'category' => 'menu',
                'name' => 'Spicy Tuna Roll',
                'description' => 'Thon rouge épicé, avocat onctueux et notre sauce signature',
                'price' => 9.50,
                'image_url' => 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80',
                'is_new' => false,
                'display_order' => 3,
            ],
            [
                'category' => 'specialty',
                'name' => 'Dragon Roll',
                'description' => 'Anguille grillée sauce teriyaki, concombre et avocat, tobiko orange',
                'price' => 12.00,
                'image_url' => 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&q=80',
                'is_new' => false,
                'display_order' => 4,
            ],
            [
                'category' => 'specialty',
                'name' => 'Rainbow Roll',
                'description' => 'Assortiment de 5 poissons nobles et avocat fondant',
                'price' => 13.50,
                'image_url' => 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80',
                'is_new' => false,
                'display_order' => 5,
            ],
            [
                'category' => 'specialty',
                'name' => 'Chirashi Bowl',
                'description' => 'Assortiment de sashimi du jour sur riz parfumé au yuzu',
                'price' => 16.00,
                'image_url' => 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80',
                'is_new' => false,
                'display_order' => 6,
            ],
            [
                'category' => 'new',
                'name' => 'Truffle Salmon Roll',
                'description' => 'Saumon royal, précieuse huile de truffe noire, roquette sauvage',
                'price' => 14.50,
                'image_url' => 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&q=80',
                'is_new' => true,
                'display_order' => 7,
            ],
            [
                'category' => 'new',
                'name' => 'Mango Tango Roll',
                'description' => 'Mangue alphonso fraîche et crevette tempura ultra croustillante',
                'price' => 11.00,
                'image_url' => 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80',
                'is_new' => true,
                'display_order' => 8,
            ],
            [
                'category' => 'new',
                'name' => 'Black Sesame Roll',
                'description' => 'Thon bluefin, sésame noir toasté, wasabi mayo maison',
                'price' => 10.50,
                'image_url' => 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&q=80',
                'is_new' => true,
                'display_order' => 9,
            ],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['name' => $product['name']],
                [
                    'category_id' => $categories[$product['category']]->id,
                    'description' => $product['description'],
                    'price' => $product['price'],
                    'image_url' => $product['image_url'],
                    'image_path' => null,
                    'is_new' => $product['is_new'],
                    'is_available' => true,
                    'display_order' => $product['display_order'],
                ],
            );
        }
    }
}
