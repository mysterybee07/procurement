<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Traits\HasRoles;

class Vendor extends Model
{
    use HasRoles;
    protected $fillable = [
        'user_id',
        'vendor_name',
        'registration_number', 
        'pan_number',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
