<?php

namespace App\Repositories;

use App\Repositories\Interfaces\BaseInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class BaseRepository implements BaseInterface
{
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function getAllPaginated(int $perPage = 10, array $relations = []): LengthAwarePaginator
    {
        return $this->model->with($relations)->paginate($perPage);
    }   

    public function getAll(): Collection
    {
        return $this->model->all();
    }

    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    public function update(Model $model, array $data): bool
    {
        return $model->update($data);
    }

    public function delete(Model $model): bool
    {
        return $model->delete();
    }

    public function findById(int $id): ?Model
    {
        return $this->model->find($id);
    }
}
