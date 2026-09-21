<?php

namespace Database\Factories;

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 10, 80);
        $deliveryFee = fake()->boolean() ? 0 : 5;

        return [
            'order_number' => 'MS-'.fake()->unique()->numerify('######'),
            'user_id' => User::factory(),
            'status' => OrderStatus::PENDING,
            'delivery_type' => DeliveryType::DELIVERY,
            'delivery_address' => fake()->address(),
            'comments' => fake()->boolean(40) ? fake()->sentence() : null,
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'total' => $subtotal + $deliveryFee,
            'accepted_at' => null,
            'rejected_at' => null,
        ];
    }
}
