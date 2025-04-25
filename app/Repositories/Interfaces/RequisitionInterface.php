<?php

namespace App\Repositories\Interfaces;

use App\Models\Requisition;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface RequisitionInterface
{
    public function getAllPaginated(int $perPage): LengthAwarePaginator;
    public function getById(int $id): ?Requisition;
    public function create(array $data): Requisition;
    public function update(Requisition $requisition, array $data): bool;
    public function delete(Requisition $requisition): bool;
    public function submitRequisition(Requisition $requisition): bool;
    public function fulfillRequisitionItem(int $id, int $providedQuantity): array;
    public function receiveRequisitionItem(int $id): bool;
}
