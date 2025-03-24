<?php

namespace App\Providers;

use App\Models\Requisition;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('requisitions.view', function(User $user, Requisition $requisition){
            return ((bool) $user->is_admin || $user->id === $requisition->user_id);
        });
    }
}
