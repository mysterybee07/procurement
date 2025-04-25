<?php

namespace App\Services;

use App\Models\VendorEOIDocument;
use App\Models\VendorRating;
use App\Models\VendorEOISubmission;
use App\Models\EOI;
// use Illuminate\Support\Collection;

class VendorRatingService
{
    public function updateVendorRatingsForEoi($eoiId)
    {
        // Eager load items and documents to avoid N+1 query problems
        $submissions = VendorEOISubmission::with(['vendorSubmittedItems'])
            ->where('eoi_id', $eoiId)
            ->get();
            // dd($submissions);

        foreach ($submissions as $submission) {
            $this->updateVendorRating($submission);
        }
    }

    public function updateVendorRating(VendorEOISubmission $submission)
    {
        $lowestPrice = $this->getLowestAdjustedPrice($submission->eoi_id);

        $documentScore = $this->calculateDocumentScore($submission);
        $submissionCompletenessScore = $this->calculateSubmissionCompletenessScore($submission);
        $totalPricingScore = $this->calculateTotalPricingScore($submission, $lowestPrice);
        $deliveryScore = $this->calculateDeliveryScore($submission);
        $pastPerformanceScore = $this->getPastPerformanceScore($submission->vendor_id);

        $overallRating = (0.3 * $documentScore) +
                         (0.25 * $totalPricingScore) +
                         (0.2 * $submissionCompletenessScore) +
                         (0.15 * $deliveryScore) +
                         (0.1 * $pastPerformanceScore);

        // Update or create the vendor rating record
        VendorRating::updateOrCreate(
            ['vendor_id' => $submission->vendor_id, 'eoi_id' => $submission->eoi_id],
            [
                'vendor_eoi_submission_id' => $submission->id,
                'total_pricing_score' => $totalPricingScore,
                'delivery_date_score' => $deliveryScore,
                'submission_completeness_score' => $submissionCompletenessScore,
                'document_score' => $documentScore,
                'past_performance_score' => $pastPerformanceScore,
                'overall_rating' => $overallRating,
            ]
        );
    }

    private function getLowestAdjustedPrice($eoiId)
    {
        $submissions = VendorEOISubmission::where('eoi_id', $eoiId)->get();

        // Ensure we exclude null or zero total prices
        $validPrices = $submissions->map(function ($sub) {
            return $this->calculateAdjustedPrice($sub);
        })->filter(fn($price) => $price > 0);

        return $validPrices->min() ?? 1; 
    }

    private function calculateDocumentScore(VendorEOISubmission $submission)
    {
        // Get total required documents for this EOI
        $totalRequiredDocs = VendorEOIDocument::where('eoi_submission_id', $submission->id)->count();

        // Get submitted and accepted documents
        $submittedDocs = VendorEOIDocument::where('eoi_submission_id', $submission->id)
            ->whereIn('status', ['accepted'])
            ->count();

        if ($totalRequiredDocs == 0) {
            return 5; 
        }

        return 5 * ($submittedDocs / max($totalRequiredDocs, 1));
    }

    private function calculateSubmissionCompletenessScore(VendorEOISubmission $submission)
    {
        $items = $submission->vendorSubmittedItems;
    
        if (!$items || $items->isEmpty()) {
            return 5;
        }
    
        $totalRequired = $items->sum(function ($item) {
            return optional($item->requestItem)->required_quantity ?? 0;
        });
        // dd($totalRequired);
    
        $totalSubmitted = $items->sum('submitted_quantity');
        // dd($totalSubmitted);
    
        if ($totalRequired==0 || $totalRequired==$totalSubmitted) {
            return 5;
        }
    
        return 5 * ($totalSubmitted / max($totalRequired, 1)) / max($items->count(), 1);
    }
    

    private function calculateAdjustedPrice(VendorEOISubmission $submission)
    {
        $completenessScore = $this->calculateSubmissionCompletenessScore($submission);
        
        return $submission->items_total_price / max($completenessScore, 1);
    }

    private function calculateTotalPricingScore(VendorEOISubmission $submission, $lowestPrice)
    {
        $adjustedPrice = $this->calculateAdjustedPrice($submission);
        return 5 * ($lowestPrice / max($adjustedPrice, 1));
    }

    private function calculateDeliveryScore(VendorEOISubmission $submission)
    {
        $eoi = EOI::find($submission->eoi_id);
        
        if (!$eoi || !$eoi->earliest_delivery_date || !$submission->delivery_date) {
            return 3; 
        }

        $earliestDeliveryDate = $eoi->earliest_delivery_date;

        if ($submission->delivery_date <= $earliestDeliveryDate) {
            return 5;
        }

        $daysLate = $submission->delivery_date->diffInDays($earliestDeliveryDate);
        return max(5 - ($daysLate * 0.5), 1);
    }

    private function getPastPerformanceScore($vendorId)
    {
        $ratings = VendorRating::where('vendor_id', $vendorId)->pluck('past_performance_score');
        return $ratings->count() ? $ratings->average() : 3;
    }
}
