<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'username',
        'address',
        'phone',
        'email',
        'password',
        'is_vendor', // Add this if you want to track vendor status
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_vendor' => 'boolean', // Add this if using is_vendor column
        ];
    }

    // Relationship with Vendor
    public function vendor()
    {
        return $this->hasOne(Vendor::class, 'user_id');
    }

    // Scopes
    public function scopeVendors($query)
    {
        return $query->where('is_vendor', true);
    }

    public function scopeNonVendors($query)
    {
        return $query->where('is_vendor', false);
    }

    // Helper Methods
    public function isVendor(): bool
    {
        return $this->is_vendor ?? false;
    }
}