<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductSalesStatsController extends Controller
{
    private const DEFAULT_MONTHS = 12;

    private const MAX_MONTHS = 36;

    public function __invoke(Request $request): JsonResponse
    {
        $monthCount = max(1, min($request->integer('months', self::DEFAULT_MONTHS), self::MAX_MONTHS));
        $start = now()->startOfMonth()->subMonths($monthCount - 1);

        $months = [];

        for ($offset = 0; $offset < $monthCount; $offset++) {
            $month = $start->copy()->addMonths($offset);

            $months[] = [
                'key' => $month->format('Y-m'),
                'label' => $month->translatedFormat('M Y'),
            ];
        }

        $monthKeys = array_column($months, 'key');
        $emptySeries = array_fill(0, $monthCount, 0);
        $monthExpression = $this->monthExpression();

        $rows = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', OrderStatus::ACCEPTED->value)
            ->where('orders.created_at', '>=', $start)
            ->groupBy('order_items.product_id', 'order_items.product_name', DB::raw($monthExpression))
            ->select([
                'order_items.product_id',
                'order_items.product_name',
                DB::raw("{$monthExpression} as month_key"),
                DB::raw('SUM(order_items.quantity) as quantity'),
                DB::raw('SUM(order_items.line_total) as revenue'),
            ])
            ->get();

        $products = [];

        foreach ($rows as $row) {
            $monthIndex = array_search($row->month_key, $monthKeys, true);

            if ($monthIndex === false) {
                continue;
            }

            // product_id est nullable (produit supprime) : on retombe sur le nom archive.
            $key = $row->product_id !== null ? 'id:'.$row->product_id : 'name:'.$row->product_name;

            $products[$key] ??= [
                'id' => $row->product_id,
                'name' => $row->product_name,
                'monthly' => $emptySeries,
                'total_quantity' => 0,
                'total_revenue' => 0.0,
            ];

            $products[$key]['monthly'][$monthIndex] += (int) $row->quantity;
            $products[$key]['total_quantity'] += (int) $row->quantity;
            $products[$key]['total_revenue'] += (float) $row->revenue;
        }

        $products = array_values($products);

        usort($products, static fn (array $a, array $b) => $b['total_quantity'] <=> $a['total_quantity']);

        $overallSeries = $emptySeries;

        foreach ($products as $index => $product) {
            $products[$index]['total_revenue'] = round($product['total_revenue'], 2);

            foreach ($product['monthly'] as $monthIndex => $quantity) {
                $overallSeries[$monthIndex] += $quantity;
            }
        }

        return response()->json([
            'months' => $months,
            'products' => $products,
            'all_products' => [
                'name' => 'Tous les articles',
                'monthly' => $overallSeries,
                'total_quantity' => array_sum($overallSeries),
                'total_revenue' => round(array_sum(array_column($products, 'total_revenue')), 2),
            ],
        ]);
    }

    /**
     * Regroupement par mois, ecrit selon le moteur de base utilise
     * (SQLite en local, MySQL en production).
     */
    private function monthExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'mysql', 'mariadb' => "DATE_FORMAT(orders.created_at, '%Y-%m')",
            'pgsql' => "to_char(orders.created_at, 'YYYY-MM')",
            'sqlsrv' => "FORMAT(orders.created_at, 'yyyy-MM')",
            default => "strftime('%Y-%m', orders.created_at)",
        };
    }
}
