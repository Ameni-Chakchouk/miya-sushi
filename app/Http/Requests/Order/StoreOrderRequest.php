<?php

namespace App\Http\Requests\Order;

use App\Enums\DeliveryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'delivery_type' => ['required', new Enum(DeliveryType::class)],
            'delivery_address' => ['nullable', 'string', 'max:1000', 'required_if:delivery_type,delivery'],
            'comments' => ['nullable', 'string', 'max:1500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'delivery_address.required_if' => 'L’adresse de livraison est obligatoire pour une commande en livraison.',
        ];
    }
}
