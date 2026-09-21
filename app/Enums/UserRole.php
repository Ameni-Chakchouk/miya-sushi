<?php

namespace App\Enums;

enum UserRole: string
{
    case CLIENT = 'client';
    case ADMIN = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::CLIENT => 'Client',
            self::ADMIN => 'Administrateur',
        };
    }
}
