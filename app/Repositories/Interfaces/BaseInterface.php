<?php

namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface BaseInterface
{
    public function getAllPaginated(int $perPage): LengthAwarePaginator;
    public function getAll(): Collection;
    public function create(array $data): Model;
    public function update(Model $model, array $data): bool;
    public function delete(Model $model): bool;
    public function findById(int $id): ?Model;
}
