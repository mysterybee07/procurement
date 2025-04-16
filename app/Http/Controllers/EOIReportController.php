<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EOIReportController extends Controller
{
    public function index()
    {
        $results = DB::select("
            SELECT 
                'eoi' AS type,
                e.id,
                e.eoi_number,
                e.title,
                aw.workflow_name AS approval_workflow,
                e.status,
                e.publish_date,
                e.submission_deadline,
                e.created_at,
    
                -- Requisition & product metrics
                (SELECT COUNT(*) FROM requisitions r WHERE r.eoi_id = e.id) as total_requisitions,
                (SELECT COUNT(*) FROM requisitions r JOIN request_items ri ON r.id = ri.requisition_id WHERE r.eoi_id = e.id) as total_requested_products,
                (
                    SELECT GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ')
                    FROM requisitions r
                    JOIN request_items ri ON ri.requisition_id = r.id
                    JOIN products p ON p.id = ri.product_id
                    WHERE r.eoi_id = e.id
                ) AS products,
    
                -- Submission stats
                (SELECT COUNT(*) FROM vendor_eoi_submissions ves WHERE ves.eoi_id = e.id) as total_submissions,
                (SELECT AVG(ves.items_total_price) FROM vendor_eoi_submissions ves WHERE ves.eoi_id = e.id) as avg_total_price,
                
                -- Min price vendor
                (
                    SELECT ves.items_total_price 
                    FROM vendor_eoi_submissions ves 
                    WHERE ves.eoi_id = e.id 
                    ORDER BY ves.items_total_price ASC 
                    LIMIT 1
                ) as min_total_price,
                (
                    SELECT v.vendor_name 
                    FROM vendor_eoi_submissions ves
                    JOIN vendors v ON v.id = ves.vendor_id
                    WHERE ves.eoi_id = e.id 
                    ORDER BY ves.items_total_price ASC 
                    LIMIT 1
                ) as min_price_vendor,
                
                -- Max price vendor
                (
                    SELECT ves.items_total_price 
                    FROM vendor_eoi_submissions ves 
                    WHERE ves.eoi_id = e.id 
                    ORDER BY ves.items_total_price DESC 
                    LIMIT 1
                ) as max_total_price,
                (
                    SELECT v.vendor_name 
                    FROM vendor_eoi_submissions ves
                    JOIN vendors v ON v.id = ves.vendor_id
                    WHERE ves.eoi_id = e.id 
                    ORDER BY ves.items_total_price DESC 
                    LIMIT 1
                ) as max_price_vendor,
                
                -- Best vendor (by rating)
                (
                    SELECT v.vendor_name
                    FROM vendor_ratings vr
                    JOIN vendors v ON v.id = vr.vendor_id
                    WHERE vr.eoi_id = e.id
                    ORDER BY vr.overall_rating DESC
                    LIMIT 1
                ) as best_vendor
    
            FROM eois e
            LEFT JOIN approval_workflows aw ON e.approval_workflow_id = aw.id
    
            UNION ALL
    
            SELECT
                'stats' AS type,
                NULL AS id,
                NULL AS eoi_number,
                NULL AS title,
                NULL AS approval_workflow,
                NULL AS status,
                NULL AS publish_date,
                NULL AS submission_deadline,
                NULL AS created_at,
                COUNT(*) AS total_requisitions,
                NULL AS total_requested_products,
                NULL AS products,
                NULL AS total_submissions,
                NULL AS avg_total_price,
                NULL AS min_total_price,
                NULL AS min_price_vendor,
                NULL AS max_total_price,
                NULL AS max_price_vendor,
                NULL AS best_vendor
            FROM requisitions
        ");
    
        return Inertia::render('report/report', [
            'overview' => $results,
        ]);
    } 
    
    public function show($eoi_id)
    {
        // Get all EOI data with a single query
        $data = DB::select("
            WITH best_vendors AS (
                SELECT 
                    vsi.request_items_id,
                    GROUP_CONCAT(DISTINCT v.vendor_name ORDER BY v.vendor_name SEPARATOR ', ') as best_vendor_names
                FROM vendor_submitted_items vsi
                JOIN vendor_eoi_submissions ves ON vsi.vendor_eoi_submission_id = ves.id
                JOIN vendors v ON ves.vendor_id = v.id
                JOIN (
                    SELECT 
                        request_items_id,
                        MIN(actual_unit_price) as min_price
                    FROM vendor_submitted_items
                    GROUP BY request_items_id
                ) as min_prices ON vsi.request_items_id = min_prices.request_items_id AND vsi.actual_unit_price = min_prices.min_price
                GROUP BY vsi.request_items_id
            )            
            SELECT 
                -- EOI overview section
                e.id,
                e.eoi_number,
                e.title,
                e.status,
                e.publish_date,
                e.submission_deadline,
                e.created_at,
                (SELECT COUNT(*) FROM vendor_eoi_submissions ves WHERE ves.eoi_id = e.id) as total_submissions,
                (SELECT COUNT(*) FROM vendor_eoi_submissions ves WHERE ves.eoi_id = e.id AND ves.is_shortlisted = 1) as shortlisted_submissions,
                (SELECT COUNT(*) FROM requisitions r WHERE r.eoi_id = e.id) as linked_requisitions,
                
                -- Submissions section
                ves.id as submission_id,
                v.vendor_name,
                u.email as vendor_email,
                ves.status as submission_status,
                ves.submission_date,
                ves.items_total_price,
                ves.is_shortlisted,
                (SELECT COUNT(*) FROM vendor_submitted_items vsi WHERE vsi.vendor_eoi_submission_id = ves.id) AS items_submitted,
                ves.remarks,
                
                -- Comparisons section
                ri.id as request_item_id,
                p.name as product_name,
                ri.required_quantity,
                (SELECT AVG(vsi.actual_unit_price) FROM vendor_submitted_items vsi WHERE vsi.request_items_id = ri.id) as avg_unit_price,
                (SELECT MIN(vsi.actual_unit_price) FROM vendor_submitted_items vsi WHERE vsi.request_items_id = ri.id) as min_unit_price,
                (SELECT MAX(vsi.actual_unit_price) FROM vendor_submitted_items vsi WHERE vsi.request_items_id = ri.id) as max_unit_price,
                (SELECT COUNT(DISTINCT ves_inner.vendor_id) FROM vendor_submitted_items vsi_inner 
                    JOIN vendor_eoi_submissions ves_inner ON vsi_inner.vendor_eoi_submission_id = ves_inner.id 
                    WHERE vsi_inner.request_items_id = ri.id) as vendor_offers,
                (SELECT SUM(vsi.submitted_quantity) FROM vendor_submitted_items vsi WHERE vsi.request_items_id = ri.id) as total_offered_quantity,
                bv.best_vendor_names as best_vendor,
                
                -- Timeline section
                ra.id as approval_id,
                ra.status as approval_status,
                ra.comments,
                ra.action_date,
                approver.name as approver_name,
                aps.step_name
                
            FROM eois e
            -- Submissions join
            LEFT JOIN vendor_eoi_submissions ves ON ves.eoi_id = e.id
            LEFT JOIN vendors v ON ves.vendor_id = v.id
            LEFT JOIN users u ON v.user_id = u.id
            
            -- Comparisons join
            LEFT JOIN requisitions req ON req.eoi_id = e.id
            LEFT JOIN request_items ri ON ri.requisition_id = req.id
            LEFT JOIN products p ON ri.product_id = p.id
            LEFT JOIN best_vendors bv ON bv.request_items_id = ri.id
            
            -- Timeline join
            LEFT JOIN request_approvals ra ON ra.entity_id = e.id AND ra.entity_type = 'eoi'
            LEFT JOIN users approver ON ra.approver_id = approver.id
            LEFT JOIN approval_steps aps ON ra.approval_step_id = aps.id
            
            WHERE e.id = ?
            ORDER BY ves.submission_date DESC, p.name, ra.created_at
        ", [$eoi_id]);
        
        // Initialize data structure
        $overview = null;
        $submissions = [];
        $comparisons = [];
        $timeline = [];
        
        // Process result rows into structured data
        foreach ($data as $row) {
            if (!$overview) {
                $overview = [
                    'id' => $row->id,
                    'eoi_number' => $row->eoi_number,
                    'title' => $row->title,
                    'status' => $row->status,
                    'publish_date' => $row->publish_date,
                    'submission_deadline' => $row->submission_deadline,
                    'created_at' => $row->created_at,
                    'total_submissions' => $row->total_submissions,
                    'shortlisted_submissions' => $row->shortlisted_submissions,
                    'linked_requisitions' => $row->linked_requisitions
                ];
            }
            
            // Process submissions data
            if (!empty($row->submission_id) && !isset($submissions[$row->submission_id])) {
                $submissions[$row->submission_id] = [
                    'id' => $row->submission_id,
                    'vendor_name' => $row->vendor_name,
                    'vendor_email' => $row->vendor_email,
                    'status' => $row->submission_status,
                    'submission_date' => $row->submission_date,
                    'items_total_price' => $row->items_total_price,
                    'is_shortlisted' => $row->is_shortlisted,
                    'items_submitted' => $row->items_submitted,
                    'remarks' => $row->remarks
                ];
            }
            
            // Process comparisons data
            if (!empty($row->request_item_id) && !isset($comparisons[$row->request_item_id])) {
                $comparisons[$row->request_item_id] = [
                    'request_item_id' => $row->request_item_id,
                    'product_name' => $row->product_name,
                    'required_quantity' => $row->required_quantity,
                    'avg_unit_price' => $row->avg_unit_price,
                    'min_unit_price' => $row->min_unit_price,
                    'max_unit_price' => $row->max_unit_price,
                    'vendor_offers' => $row->vendor_offers,
                    'total_offered_quantity' => $row->total_offered_quantity,
                    'best_vendor' => $row->best_vendor
                ];
            }
            
            // Process timeline data
            if (!empty($row->approval_id) && !isset($timeline[$row->approval_id])) {
                $timeline[$row->approval_id] = [
                    'status' => $row->approval_status,
                    'comments' => $row->comments,
                    'action_date' => $row->action_date,
                    'approver_name' => $row->approver_name,
                    'step_name' => $row->step_name
                ];
            }
        }
        
        // Ensure we have arrays for Inertia
        $eoiData = [
            'overview' => $overview,
            'submissions' => array_values($submissions),
            'comparisons' => array_values($comparisons),
            'timeline' => array_values($timeline)
        ];
        
        return Inertia::render('report/single-eoi-summary', [
            'eoiData' => $eoiData
        ]);
    }
    
    public function exportToExcel($eoi_id)
    {
        // Implementation for exporting data to Excel
    }
    
    public function printReport($eoi_id)
    {
        // Implementation for generating a printable report
    }
}