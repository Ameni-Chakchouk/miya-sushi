<?php

namespace App\Services;

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\RestaurantSetting;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function create(User $user, array $payload): Order
    {
        $products = Product::query()
            ->whereIn('id', collect($payload['items'])->pluck('product_id')->all())
            ->with('category')
            ->get()
            ->keyBy('id');

        $items = collect($payload['items'])->map(function (array $item) use ($products) {
            $product = $products->get((int) $item['product_id']);

            if (! $product || ! $product->is_available) {
                throw ValidationException::withMessages([
                    'items' => ['Un ou plusieurs produits sélectionnés ne sont pas disponibles.'],
                ]);
            }

            $quantity = (int) $item['quantity'];
            $unitPrice = (float) $product->price;

            return [
                'product' => $product,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_price' => $unitPrice,
                'quantity' => $quantity,
                'line_total' => round($unitPrice * $quantity, 2),
            ];
        });

        $subtotal = round((float) $items->sum('line_total'), 2);
        $deliveryType = DeliveryType::from($payload['delivery_type']);
        $deliveryFee = $deliveryType === DeliveryType::DELIVERY
            ? (float) RestaurantSetting::value('delivery_fee', 0)
            : 0.0;
        $minimumOrderAmount = (float) RestaurantSetting::value('minimum_order_amount', 0);

        if ($subtotal < $minimumOrderAmount) {
            throw ValidationException::withMessages([
                'items' => ['Le montant minimum de commande n’est pas atteint.'],
            ]);
        }

        $order = DB::transaction(function () use ($user, $payload, $items, $subtotal, $deliveryFee, $deliveryType) {
            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $user->id,
                'status' => OrderStatus::PENDING,
                'delivery_type' => $deliveryType,
                'delivery_address' => $deliveryType === DeliveryType::DELIVERY
                    ? Arr::get($payload, 'delivery_address')
                    : null,
                'comments' => Arr::get($payload, 'comments'),
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total' => round($subtotal + $deliveryFee, 2),
            ]);

            $order->items()->createMany($items->map(fn (array $item) => Arr::except($item, ['product']))->all());

            return $order->load(['items', 'user']);
        });

        return $order;
    }

    private function generateOrderNumber(): string
    {
        do {
            $number = 'MS-'.now()->format('Ymd').'-'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }
}
