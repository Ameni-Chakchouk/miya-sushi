<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'delivery_type' => $this->delivery_type->value,
            'delivery_type_label' => $this->delivery_type->label(),
            'delivery_address' => $this->delivery_address,
            'comments' => $this->comments,
            'subtotal' => (float) $this->subtotal,
            'delivery_fee' => (float) $this->delivery_fee,
            'total' => (float) $this->total,
            'accepted_at' => $this->accepted_at?->toIso8601String(),
            'rejected_at' => $this->rejected_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'created_at_display' => $this->created_at?->locale('fr')->translatedFormat('d/m/Y H:i'),
            'customer' => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'customer_email' => $this->whenLoaded('user', fn () => $this->user->email),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
