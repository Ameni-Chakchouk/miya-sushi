<?php

namespace App\Enums;

enum DeliveryType: string
{
    case DELIVERY = 'delivery';
    case TAKEAWAY = 'takeaway';

    public function label(): string
    {
        return match ($this) {
            self::DELIVERY => 'Livraison',
            self::TAKEAWAY => 'À emporter',
        };
    }
}
