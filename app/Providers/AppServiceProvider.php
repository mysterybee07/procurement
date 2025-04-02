<?php

namespace App\Providers;

use App\Models\EOI;
use App\Models\Requisition;
use App\Models\User;
use App\Observers\EOIObserver;
use App\Observers\RequisitionObserver;
use App\Repositories\Interfaces\ProductCategoryInterface;
use App\Repositories\Interfaces\ProductInterface;
use App\Repositories\Interfaces\RequisitionInterface;
use App\Repositories\Interfaces\RoleInterface;
use App\Repositories\ProductCategoryRepository;
use App\Repositories\ProductRepository;
use App\Repositories\RequisitionRepository;
use App\Repositories\RoleRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ProductCategoryInterface::class, ProductCategoryRepository::class);
        $this->app->bind(ProductInterface::class, ProductRepository::class);
        $this->app->bind(RequisitionInterface::class, RequisitionRepository::class);
        $this->app->bind(RoleInterface::class, RoleRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        EOI::observe(EOIObserver::class);
        Requisition::observe(RequisitionObserver::class);
        // $this->registerPolicies();

        // Super Admin Bypass
        Gate::before(function (User $user, $ability) {
            if ($user->is_super_admin) {
                return true;
            }
        });
    }
}
