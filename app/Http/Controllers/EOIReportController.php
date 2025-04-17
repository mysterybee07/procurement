<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EOIReportController extends Controller
{
    public function index()
    {
        $results = DB::select("
            -- EOI data with aggregated information
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
                COUNT(DISTINCT r.id) as total_requisitions,
                COUNT(DISTINCT ri.id) as total_requested_products,
                GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') AS products,
                
                -- Submission stats
                COUNT(DISTINCT ves.id) as total_submissions,
                AVG(ves.items_total_price) as avg_total_price,
                
                -- Min price vendor
                MIN(ves.items_total_price) as min_total_price,
                MIN(
                    CASE WHEN ves.items_total_price = min_prices.min_price 
                    THEN v.vendor_name ELSE NULL END
                ) as min_price_vendor,
                
                -- Max price vendor
                MAX(ves.items_total_price) as max_total_price,
                MIN(
                    CASE WHEN ves.items_total_price = max_prices.max_price 
                    THEN v.vendor_name ELSE NULL END
                ) as max_price_vendor,
                
                -- Best vendor (by rating)
                MIN(
                    CASE WHEN vr.overall_rating = best_vendors.max_rating
                    THEN v2.vendor_name ELSE NULL END
                ) as best_vendor
                
            FROM eois e
            LEFT JOIN approval_workflows aw ON e.approval_workflow_id = aw.id
            LEFT JOIN requisitions r ON r.eoi_id = e.id
            LEFT JOIN request_items ri ON ri.requisition_id = r.id
            LEFT JOIN products p ON p.id = ri.product_id
            LEFT JOIN vendor_eoi_submissions ves ON ves.eoi_id = e.id
            LEFT JOIN vendors v ON v.id = ves.vendor_id
            LEFT JOIN vendor_ratings vr ON vr.eoi_id = e.id
            LEFT JOIN vendors v2 ON v2.id = vr.vendor_id
            
            -- Subqueries to find min and max prices per EOI
            LEFT JOIN (
                SELECT eoi_id, MIN(items_total_price) as min_price
                FROM vendor_eoi_submissions
                GROUP BY eoi_id
            ) min_prices ON min_prices.eoi_id = e.id
            
            -- Subquery to find max prices per EOI
            LEFT JOIN (
                SELECT eoi_id, MAX(items_total_price) as max_price
                FROM vendor_eoi_submissions
                GROUP BY eoi_id
            ) max_prices ON max_prices.eoi_id = e.id
            
            -- Subquery to find best vendor rating per EOI
            LEFT JOIN (
                SELECT eoi_id, MAX(overall_rating) as max_rating
                FROM vendor_ratings
                GROUP BY eoi_id
            ) best_vendors ON best_vendors.eoi_id = e.id
            
            GROUP BY e.id, e.eoi_number, e.title, aw.workflow_name, e.status, 
                    e.publish_date, e.submission_deadline, e.created_at

            UNION ALL

            -- Summary stats row
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
        // Get all EOI data with optimized query
        $data = DB::select("
            WITH 
            -- Common Table Expressions for reusable subqueries
            submission_stats AS (
                SELECT 
                    eoi_id,
                    COUNT(*) as total_submissions,
                    SUM(CASE WHEN is_shortlisted = 1 THEN 1 ELSE 0 END) as shortlisted_submissions
                FROM vendor_eoi_submissions
                GROUP BY eoi_id
            ),
            
            requisition_stats AS (
                SELECT 
                    eoi_id,
                    COUNT(*) as linked_requisitions
                FROM requisitions
                GROUP BY eoi_id
            ),
            
            item_pricing AS (
                SELECT 
                    ri.id as request_item_id,
                    AVG(vsi.actual_unit_price) as avg_unit_price,
                    MIN(vsi.actual_unit_price) as min_unit_price,
                    MAX(vsi.actual_unit_price) as max_unit_price,
                    COUNT(DISTINCT ves.vendor_id) as vendor_offers,
                    SUM(vsi.submitted_quantity) as total_offered_quantity
                FROM request_items ri
                JOIN vendor_submitted_items vsi ON vsi.request_items_id = ri.id
                JOIN vendor_eoi_submissions ves ON vsi.vendor_eoi_submission_id = ves.id
                GROUP BY ri.id
            ),
            
            best_vendors AS (
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
                ) as min_prices ON vsi.request_items_id = min_prices.request_items_id 
                                AND vsi.actual_unit_price = min_prices.min_price
                GROUP BY vsi.request_items_id
            ),
            
            submission_items_count AS (
                SELECT 
                    vendor_eoi_submission_id,
                    COUNT(*) as items_submitted
                FROM vendor_submitted_items
                GROUP BY vendor_eoi_submission_id
            )
            
            -- Main query using the CTEs
            SELECT 
                -- EOI overview section
                e.id,
                e.eoi_number,
                e.title,
                e.status,
                e.publish_date,
                e.submission_deadline,
                e.created_at,
                ss.total_submissions,
                ss.shortlisted_submissions,
                rs.linked_requisitions,
                
                -- Submissions section
                ves.id as submission_id,
                v.vendor_name,
                u.email as vendor_email,
                ves.status as submission_status,
                ves.submission_date,
                ves.items_total_price,
                ves.is_shortlisted,
                sic.items_submitted,
                ves.remarks,
                
                -- Comparisons section
                ri.id as request_item_id,
                p.name as product_name,
                ri.required_quantity,
                ip.avg_unit_price,
                ip.min_unit_price,
                ip.max_unit_price,
                ip.vendor_offers,
                ip.total_offered_quantity,
                bv.best_vendor_names as best_vendor,
                
                -- Timeline section
                ra.id as approval_id,
                ra.status as approval_status,
                ra.comments,
                ra.action_date,
                approver.name as approver_name,
                aps.step_name
                
            FROM eois e
            -- Overview stats joins
            LEFT JOIN submission_stats ss ON ss.eoi_id = e.id
            LEFT JOIN requisition_stats rs ON rs.eoi_id = e.id
            
            -- Submissions joins
            LEFT JOIN vendor_eoi_submissions ves ON ves.eoi_id = e.id
            LEFT JOIN vendors v ON ves.vendor_id = v.id
            LEFT JOIN users u ON v.user_id = u.id
            LEFT JOIN submission_items_count sic ON sic.vendor_eoi_submission_id = ves.id
            
            -- Comparisons joins
            LEFT JOIN requisitions req ON req.eoi_id = e.id
            LEFT JOIN request_items ri ON ri.requisition_id = req.id
            LEFT JOIN products p ON ri.product_id = p.id
            LEFT JOIN item_pricing ip ON ip.request_item_id = ri.id
            LEFT JOIN best_vendors bv ON bv.request_items_id = ri.id
            
            -- Timeline joins
            LEFT JOIN request_approvals ra ON ra.entity_id = e.id AND ra.entity_type = 'eoi'
            LEFT JOIN users approver ON ra.approver_id = approver.id
            LEFT JOIN approval_steps aps ON ra.approval_step_id = aps.id
            
            WHERE e.id = ?
            ORDER BY ves.submission_date DESC, p.name, ra.created_at
        ", [$eoi_id]);
        
        // Rest of your processing code remains the same...
        $overview = null;
        $submissions = [];
        $comparisons = [];
        $timeline = [];
        
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
        
    }
    
    public function printReport($eoi_id)
    {
        
    }
}