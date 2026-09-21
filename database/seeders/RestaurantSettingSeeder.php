<?php

namespace Database\Seeders;

use App\Models\RestaurantSetting;
use Illuminate\Database\Seeder;

class RestaurantSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'restaurant_name' => 'Miya Sushi',
            'currency' => 'EUR',
            'delivery_fee' => '0',
            'minimum_order_amount' => '0',
            'opening_hours' => 'Lun-Dim 11:30-22:30',
            'contact_phone' => '+33 1 00 00 00 00',
        ];

        foreach ($settings as $key => $value) {
            RestaurantSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
        }
    }
}
