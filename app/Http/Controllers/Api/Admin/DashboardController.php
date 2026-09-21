<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $today = now()->startOfDay();

        $latestOrders = Order::query()
            ->with(['items', 'user'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'today_orders_count' => Order::query()->whereDate('created_at', $today)->count(),
            'pending_orders_count' => Order::query()->where('status', OrderStatus::PENDING)->count(),
            'today_revenue' => (float) Order::query()
                ->where('status', OrderStatus::ACCEPTED)
                ->whereDate('accepted_at', $today)
                ->sum('total'),
            'total_orders_count' => Order::query()->count(),
            'latest_orders' => OrderResource::collection($latestOrders),
        ]);
    }
}
