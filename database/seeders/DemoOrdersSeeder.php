<?php

namespace Database\Seeders;

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Commandes de demonstration reparties sur les 12 derniers mois,
 * uniquement pour alimenter les statistiques de vente.
 *
 * Volontairement absent de DatabaseSeeder : a lancer a la main avec
 *   php artisan db:seed --class=DemoOrdersSeeder
 * Les commandes creees portent le prefixe DEMO- et sont re-generees a chaque
 * passage : les vraies commandes ne sont jamais touchees.
 */
class DemoOrdersSeeder extends Seeder
{
    private const MONTHS = 12;

    /** Nombre total de commandes de demonstration a repartir sur la periode. */
    private const TARGET_ORDERS = 20;

    private const DELIVERY_FEE = 3.50;

    public function run(): void
    {
        $products = Product::query()->get();

        if ($products->isEmpty()) {
            $this->command?->warn('Aucun produit en base : lancez d\'abord ProductSeeder.');

            return;
        }

        $client = User::query()->where('email', 'client@gmail.com')->first()
            ?? User::query()->where('role', '!=', 'admin')->first();

        if ($client === null) {
            $this->command?->warn('Aucun client en base : lancez d\'abord DemoClientSeeder.');

            return;
        }

        $this->clear();

        // Popularite fixe par produit pour que le graphique raconte quelque chose
        // plutot que d'etre un bruit uniforme.
        $weights = [];

        foreach ($products as $index => $product) {
            $weights[$product->id] = match ($index % 4) {
                0 => 5,
                1 => 3,
                2 => 2,
                default => 1,
            };
        }

        $created = 0;
        $sequence = 1;
        $perMonth = $this->spreadOverMonths(self::TARGET_ORDERS);

        for ($monthOffset = self::MONTHS - 1; $monthOffset >= 0; $monthOffset--) {
            $month = now()->startOfMonth()->subMonths($monthOffset);

            // Mois en cours : on ne tire pas de date dans le futur.
            $lastDay = $monthOffset === 0 ? now()->day : $month->daysInMonth;
            $orderCount = $perMonth[self::MONTHS - 1 - $monthOffset];

            for ($i = 0; $i < $orderCount; $i++) {
                $placedAt = $month->copy()
                    ->addDays(random_int(0, max(0, $lastDay - 1)))
                    ->addHours(random_int(11, 22))
                    ->addMinutes(random_int(0, 59));

                $lines = $this->pickLines($products, $weights);
                $subtotal = 0.0;

                foreach ($lines as $line) {
                    $subtotal += $line['line_total'];
                }

                $deliveryType = random_int(0, 1) === 1 ? DeliveryType::DELIVERY : DeliveryType::TAKEAWAY;
                $deliveryFee = $deliveryType === DeliveryType::DELIVERY ? self::DELIVERY_FEE : 0.0;

                $order = Order::query()->create([
                    'order_number' => sprintf('DEMO-%s-%04d', $month->format('Ym'), $sequence++),
                    'user_id' => $client->id,
                    'status' => OrderStatus::ACCEPTED,
                    'delivery_type' => $deliveryType,
                    'delivery_address' => $deliveryType === DeliveryType::DELIVERY ? $client->address : null,
                    'comments' => null,
                    'subtotal' => round($subtotal, 2),
                    'delivery_fee' => $deliveryFee,
                    'total' => round($subtotal + $deliveryFee, 2),
                    'accepted_at' => $placedAt->copy()->addMinutes(random_int(5, 40)),
                ]);

                // created_at pilote le regroupement mensuel : on le force apres coup,
                // les timestamps automatiques ecrivent la date du jour.
                $order->forceFill([
                    'created_at' => $placedAt,
                    'updated_at' => $placedAt,
                ])->saveQuietly();

                foreach ($lines as $line) {
                    $item = OrderItem::query()->create([
                        'order_id' => $order->id,
                        'product_id' => $line['product']->id,
                        'product_name' => $line['product']->name,
                        'product_price' => $line['product']->price,
                        'quantity' => $line['quantity'],
                        'line_total' => $line['line_total'],
                    ]);

                    $item->forceFill([
                        'created_at' => $placedAt,
                        'updated_at' => $placedAt,
                    ])->saveQuietly();
                }

                $created++;
            }
        }

        $this->command?->info("{$created} commandes de demonstration creees sur ".self::MONTHS.' mois.');
    }

    /**
     * Repartit $total commandes sur les mois avec une legere tendance croissante.
     * Methode du plus fort reste : la somme vaut exactement $total.
     *
     * @return array<int, int> index 0 = mois le plus ancien
     */
    private function spreadOverMonths(int $total): array
    {
        $weights = [];

        for ($i = 0; $i < self::MONTHS; $i++) {
            $weights[$i] = 1.0 + $i * 0.12;
        }

        $weightSum = array_sum($weights);
        $counts = [];
        $remainders = [];

        foreach ($weights as $i => $weight) {
            $exact = $total * $weight / $weightSum;
            $counts[$i] = (int) floor($exact);
            $remainders[$i] = $exact - $counts[$i];
        }

        arsort($remainders);

        $left = $total - array_sum($counts);

        foreach (array_keys($remainders) as $i) {
            if ($left <= 0) {
                break;
            }

            $counts[$i]++;
            $left--;
        }

        ksort($counts);

        return array_values($counts);
    }

    /**
     * Supprime uniquement les commandes de demonstration (prefixe DEMO-),
     * les vraies commandes ne sont jamais touchees.
     */
    private function clear(): void
    {
        $removed = Order::query()->where('order_number', 'like', 'DEMO-%')->delete();

        if ($removed > 0) {
            $this->command?->info("{$removed} anciennes commandes de demonstration supprimees.");
        }
    }

    /**
     * @return array<int, array{product: Product, quantity: int, line_total: float}>
     */
    private function pickLines($products, array $weights): array
    {
        $pool = [];

        foreach ($products as $product) {
            for ($i = 0; $i < ($weights[$product->id] ?? 1); $i++) {
                $pool[] = $product;
            }
        }

        $lineCount = random_int(1, 3);
        $lines = [];

        for ($i = 0; $i < $lineCount; $i++) {
            $product = $pool[array_rand($pool)];

            if (isset($lines[$product->id])) {
                continue;
            }

            $quantity = random_int(1, 4);

            $lines[$product->id] = [
                'product' => $product,
                'quantity' => $quantity,
                'line_total' => round((float) $product->price * $quantity, 2),
            ];
        }

        return array_values($lines);
    }
}
