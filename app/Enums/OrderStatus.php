<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case REJECTED = 'rejected';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'En préparation',
            self::ACCEPTED => 'Validée',
            self::REJECTED => 'Annulée',
            self::CANCELLED => 'Annulée',
        };
    }
}
