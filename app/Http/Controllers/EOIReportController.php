<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EOIReportController extends Controller
{
    public function index()
    {
        // Get EOI overview data
        $overview = DB::select("
            SELECT 
                e.id,
                e.eoi_number,
                e.title,
                e.status,
                e.publish_date,
                e.submission_deadline,
                e.created_at,
                (SELECT COUNT(*) FROM vendor_eoi_submissions ves WHERE ves.eoi_id = e.id) as total_submissions,
                (SELECT COUNT(*) FROM vendor_eoi_submissions ves WHERE ves.eoi_id = e.id AND ves.is_shortlisted = 1) as shortlisted_submissions,
                (SELECT COUNT(*) FROM requisitions r WHERE r.eoi_id = e.id) as linked_requisitions
            FROM eois e
            ORDER BY e.created_at DESC
        ");

        // Get statistics
        $stats = [
            'total_eois' => DB::table('eois')->count(),
            'total_vendors' => DB::table('vendors')->count(),
            'total_requisitions' => DB::table('requisitions')->count(),
        ];

        return Inertia::render('report/eoi-report', [
            'overview' => $overview,
            'stats' => $stats,
        ]);
    }

    public function show($eoi_id)
    {
        // Get EOI overview data for all EOIs
        $overview = DB::select("
            SELECT 
                e.id,
                e.eoi_number,
                e.title,
                e.status,
                e.publish_date,
                e.submission_deadline,
                e.created_at,
                (SELECT COUNT(*) FROM vendor_eoi_submissions ves WHERE ves.eoi_id = e.id) as total_submissions,
                (SELECT COUNT(*) FROM vendor_eoi_submissions ves WHERE ves.eoi_id = e.id AND ves.is_shortlisted = 1) as shortlisted_submissions,
                (SELECT COUNT(*) FROM requisitions r WHERE r.eoi_id = e.id) as linked_requisitions
            FROM eois e
            ORDER BY e.created_at DESC
        ");

        // Get specific EOI submissions
        $submissions = DB::select("
            SELECT 
                ves.id,
                v.vendor_name AS vendor_name,
                u.email AS vendor_email,
                ves.status,
                ves.submission_date,
                ves.items_total_price,
                ves.is_shortlisted,
                (SELECT COUNT(*) FROM vendor_submitted_items vsi WHERE vsi.vendor_eoi_submission_id = ves.id) AS items_submitted,
                ves.remarks
            FROM vendor_eoi_submissions ves
            JOIN vendors v ON ves.vendor_id = v.id
            JOIN users u ON v.user_id = u.id
            WHERE ves.eoi_id = ?
            ORDER BY ves.submission_date DESC
        ", [$eoi_id]);    

        // Get item price comparison data
        $comparisons = DB::select("
            SELECT 
            ri.id as request_item_id,
            p.name as product_name,
            ri.required_quantity,
            AVG(vsi.actual_unit_price) as avg_unit_price,
            MIN(vsi.actual_unit_price) as min_unit_price,
            MAX(vsi.actual_unit_price) as max_unit_price,
            COUNT(DISTINCT ves.vendor_id) as vendor_offers,
            SUM(vsi.submitted_quantity) as total_offered_quantity,
            GROUP_CONCAT(DISTINCT bv.best_vendor_name ORDER BY bv.best_vendor_name SEPARATOR ', ') as best_vendor
        FROM request_items ri
        JOIN products p ON ri.product_id = p.id
        JOIN requisitions req ON ri.requisition_id = req.id
        JOIN vendor_submitted_items vsi ON vsi.request_items_id = ri.id
        JOIN vendor_eoi_submissions ves ON vsi.vendor_eoi_submission_id = ves.id
        JOIN vendors v ON ves.vendor_id = v.id
        -- Subquery for best vendors per item based on minimum price
        LEFT JOIN (
            SELECT sub.request_items_id, v.vendor_name as best_vendor_name
            FROM (
                SELECT 
                    vsi.request_items_id,
                    ves.vendor_id,
                    MIN(vsi.actual_unit_price) OVER (PARTITION BY vsi.request_items_id) as min_price,
                    vsi.actual_unit_price
                FROM vendor_submitted_items vsi
                JOIN vendor_eoi_submissions ves ON ves.id = vsi.vendor_eoi_submission_id
            ) as sub
            JOIN vendors v ON v.id = sub.vendor_id
            WHERE sub.actual_unit_price = sub.min_price
        ) as bv ON bv.request_items_id = ri.id
        WHERE req.eoi_id = ?
        GROUP BY ri.id, p.name, ri.required_quantity
        ORDER BY p.name;
        ", [$eoi_id]);

        // Get approval timeline
        $timeline = DB::select("
            SELECT 
                ra.status,
                ra.comments,
                ra.action_date,
                u.name as approver_name,
                aps.step_name as step_name
            FROM request_approvals ra
            LEFT JOIN users u ON ra.approver_id = u.id
            LEFT JOIN approval_steps aps ON ra.approval_step_id = aps.id
            WHERE ra.entity_id = ? AND ra.entity_type = 'eoi'
            ORDER BY ra.created_at
        ", [$eoi_id]);

        // Get statistics
        $stats = [
            'total_eois' => DB::table('eois')->count(),
            'total_vendors' => DB::table('vendors')->count(),
            'total_requisitions' => DB::table('requisitions')->count(),
        ];

        return Inertia::render('report/eoi-report', [
            'overview' => $overview,
            'submissions' => $submissions,
            'comparisons' => $comparisons,
            'timeline' => $timeline,
            'eoi_id' => (int)$eoi_id,
            'stats' => $stats,
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