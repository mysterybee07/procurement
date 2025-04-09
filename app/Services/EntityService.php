<?php

namespace App\Services;

class EntityService
{
    /**
     * Get the fully qualified model class based on the entity type.
     *
     * @param  string  $entityType
     * @return string|null
     */
    public function getEntityModelClass($entityType)
    {
        $map = [
            'eoi' => \App\Models\EOI::class,
            // 'rfi' => \App\Models\RFI::class,
            // 'rfp' => \App\Models\RFP::class,
            // Add other entity types here
        ];

        return $map[strtolower($entityType)] ?? null;
    }
}
