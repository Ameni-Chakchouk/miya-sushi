<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class AdminOrderController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->with(['items', 'user'])
            ->latest()
            ->get();

        return OrderResource::collection($orders);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['items', 'user']);

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    public function accept(Order $order): JsonResponse
    {
        if ($order->status !== OrderStatus::PENDING) {
            return response()->json([
                'message' => 'Seules les commandes en attente peuvent être acceptées.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $order->update([
            'status' => OrderStatus::ACCEPTED,
            'accepted_at' => now(),
            'rejected_at' => null,
        ]);

        return response()->json([
            'message' => 'Commande acceptée.',
            'order' => new OrderResource($order->load(['items', 'user'])),
        ]);
    }

    public function reject(Order $order): JsonResponse
    {
        if ($order->status !== OrderStatus::PENDING) {
            return response()->json([
                'message' => 'Seules les commandes en attente peuvent être refusées.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $order->update([
            'status' => OrderStatus::REJECTED,
            'accepted_at' => null,
            'rejected_at' => now(),
        ]);

        return response()->json([
            'message' => 'Commande refusée.',
            'order' => new OrderResource($order->load(['items', 'user'])),
        ]);
    }
}
