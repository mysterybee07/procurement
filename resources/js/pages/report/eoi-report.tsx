import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';

interface EOIOverview {
    id: number;
    eoi_number: string;
    title: string;
    status: string;
    publish_date: string | null;
    submission_deadline: string | null;
    total_submissions: number;
    shortlisted_submissions: number;
    linked_requisitions: number;
    created_at: string;
}

interface EOISubmission {
    id: number;
    vendor_name: string;
    vendor_email: string;
    status: string;
    submission_date: string;
    items_total_price: number;
    is_shortlisted: boolean;
    items_submitted: number;
    remarks: string | null;
}

interface EOIItemComparison {
    request_item_id: number;
    product_name: string;
    required_quantity: number;
    avg_unit_price: number;
    min_unit_price: number;
    max_unit_price: number;
    vendor_offers: number;
    total_offered_quantity: number;
}

interface EOIApprovalTimeline {
    status: string;
    comments: string | null;
    action_date: string | null;
    approver_name: string;
    step_name: string | null;
}

interface Props extends PageProps {
    overview: EOIOverview[];
    submissions: EOISubmission[];
    comparisons: EOIItemComparison[];
    timeline: EOIApprovalTimeline[];
    eoi_id?: number;
}

export default function EOIReports({
    overview,
    submissions = [],
    comparisons = [],
    timeline = [],
    eoi_id,
}: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'details'>(eoi_id ? 'details' : 'overview');
    const [selectedEoi, setSelectedEoi] = useState<EOIOverview | null>(null);
    
    useEffect(() => {
        // Find and set the selected EOI when eoi_id is provided
        if (eoi_id && overview.length > 0) {
            const eoi = overview.find(e => e.id === eoi_id);
            if (eoi) {
                setSelectedEoi(eoi);
            }
        }
    }, [eoi_id, overview]);

    const handleEoiSelect = (eoi: EOIOverview) => {
        setSelectedEoi(eoi);
        setActiveTab('details');
        router.get(route('reports.eoi', { eoi_id: eoi.id }));
    };

    const handleExportToExcel = () => {
        if (selectedEoi) {
            window.location.href = route('reports.eoi.export', { eoi_id: selectedEoi.id });
        }
    };

    const handlePrintReport = () => {
        if (selectedEoi) {
            window.location.href = route('reports.eoi.print', { eoi_id: selectedEoi.id });
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const statusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-blue-100 text-blue-800',
            under_review: 'bg-yellow-100 text-yellow-800',
            published: 'bg-purple-100 text-purple-800',
            open: 'bg-green-100 text-green-800',
            closed: 'bg-indigo-100 text-indigo-800',
            approved: 'bg-teal-100 text-teal-800',
            rejected: 'bg-red-100 text-red-800',
            under_selection: 'bg-orange-100 text-orange-800',
            canceled: 'bg-pink-100 text-pink-800',
            pending: 'bg-yellow-100 text-yellow-800',
        };
        return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout
        >
            <Head title="EOI Reports" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex border-b mb-6">
                                <button
                                    className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    EOI Overview
                                </button>
                                {eoi_id && (
                                    <button
                                        className={`py-2 px-4 font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                                        onClick={() => setActiveTab('details')}
                                    >
                                        EOI Details
                                    </button>
                                )}
                            </div>

                            {activeTab === 'overview' && (
                                <div>
                                    <h3 className="text-lg font-medium mb-4">All EOIs</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EOI Number</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publish Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {overview.map((eoi) => (
                                                    <tr key={eoi.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">{eoi.eoi_number}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{eoi.title}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(eoi.status)}`}>
                                                                {eoi.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(eoi.publish_date)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(eoi.submission_deadline)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {eoi.total_submissions} ({eoi.shortlisted_submissions} shortlisted)
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleEoiSelect(eoi)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {overview.length === 0 && (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                                            No EOIs found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'details' && selectedEoi && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-medium">EOI Details: {selectedEoi.eoi_number}</h3>
                                        <button
                                            onClick={() => setActiveTab('overview')}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Back to Overview
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-white shadow rounded-lg p-4">
                                            <h4 className="font-medium text-gray-500 mb-2">Basic Information</h4>
                                            <p><strong>Title:</strong> {selectedEoi.title}</p>
                                            <p><strong>Status:</strong> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(selectedEoi.status)}`}>{selectedEoi.status.replace('_', ' ')}</span></p>
                                            <p><strong>Published:</strong> {formatDate(selectedEoi.publish_date)}</p>
                                            <p><strong>Deadline:</strong> {formatDate(selectedEoi.submission_deadline)}</p>
                                        </div>

                                        <div className="bg-white shadow rounded-lg p-4">
                                            <h4 className="font-medium text-gray-500 mb-2">Statistics</h4>
                                            <p><strong>Total Submissions:</strong> {selectedEoi.total_submissions}</p>
                                            <p><strong>Shortlisted:</strong> {selectedEoi.shortlisted_submissions}</p>
                                            <p><strong>Linked Requisitions:</strong> {selectedEoi.linked_requisitions}</p>
                                        </div>

                                        <div className="bg-white shadow rounded-lg p-4">
                                            <h4 className="font-medium text-gray-500 mb-2">Actions</h4>
                                            <button 
                                                className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                                onClick={handleExportToExcel}
                                            >
                                                Export to Excel
                                            </button>
                                            <button 
                                                className="bg-green-500 text-white px-3 py-1 rounded"
                                                onClick={handlePrintReport}
                                            >
                                                Print Report
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h4 className="font-medium text-lg mb-4">Vendor Submissions</h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shortlisted</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {submissions.map((sub) => (
                                                        <tr key={sub.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>{sub.vendor_name}</div>
                                                                <div className="text-sm text-gray-500">{sub.vendor_email}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(sub.status)}`}>
                                                                    {sub.status.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(sub.submission_date)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(sub.items_total_price)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{sub.items_submitted}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {sub.is_shortlisted ? (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                        Yes
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                                        No
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {submissions.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                                No submissions found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h4 className="font-medium text-lg mb-4">Item Price Comparison</h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Qty</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offers</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Price</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Price</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Offered</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {comparisons.map((item) => (
                                                        <tr key={item.request_item_id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">{item.product_name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{item.required_quantity}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{item.vendor_offers}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.min_unit_price)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.avg_unit_price)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.max_unit_price)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{item.total_offered_quantity}</td>
                                                        </tr>
                                                    ))}
                                                    {comparisons.length === 0 && (
                                                        <tr>
                                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                                                No item comparisons available
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-lg mb-4">Approval Timeline</h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Step</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approver</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {timeline.map((step, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap">{step.step_name || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(step.status)}`}>
                                                                    {step.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{step.approver_name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{step.action_date ? formatDate(step.action_date) : 'Pending'}</td>
                                                            <td className="px-6 py-4">{step.comments || 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                    {timeline.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                                                No approval history available
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}