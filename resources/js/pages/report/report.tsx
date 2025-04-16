import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

interface EOIReportItem {
    type: 'eoi' | 'stats';
    id: number | null;
    eoi_number: string | null;
    title: string | null;
    approval_workflow: string | null;
    status: string | null;
    publish_date: string | null;
    submission_deadline: string | null;
    created_at: string | null;
    total_requisitions: number;
    total_requested_products: number;
    products: string | null;
    total_submissions: number;
    avg_total_price: number | null;
    min_total_price: number | null;
    min_price_vendor: string;
    max_total_price: number | null;
    max_price_vendor: string;
    best_vendor: string | null;
}

interface Props extends PageProps {
    overview: EOIReportItem[];
}

export default function EOIReportPage({ overview }: Props) {
    console.log(overview);
    const [selectedEoiId, setSelectedEoiId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Filter out the stats row and get only EOI items
    const eoiItems = overview.filter(item => item.type === 'eoi');
    const stats = overview.find(item => item.type === 'stats');

    const handleExportToExcel = () => {
        // window.location.href = route('reports.eoi.export', { eoi_id: overview});
    };

    const handlePrintReport = () => {
        // window.location.href = route('reports.eoi.print', { eoi_id: eoiData.id });
    };

    const handleGenerateReport = () => {
        if (selectedEoiId) {
            setIsLoading(true);
            router.get(route('reports.eoi', { eoi_id: selectedEoiId }), {}, {
                onFinish: () => setIsLoading(false)
            });
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const statusColor = (status: string | null) => {
        if (!status) return 'bg-gray-100 text-gray-800';

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
        <AppLayout>
            <Head title="EOI Reports" />

            <div className="py-6 bg-gray-50">
                {/* Fixed width container for all content */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">EOI Reports Dashboard</h1>

                        <div className="flex space-x-3">
                            <button
                                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 shadow-sm"
                                onClick={handleExportToExcel}
                                disabled={isLoading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export to Excel
                            </button>
                            <button
                                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 shadow-sm"
                                onClick={handlePrintReport}
                                disabled={isLoading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Report
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <h4 className="text-gray-600 font-medium">Total EOIs</h4>
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                        <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mt-4">{eoiItems.length}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                                <span>Expressions of Interest</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <h4 className="text-gray-600 font-medium">Total Requisitions</h4>
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mt-4">{stats?.total_requisitions || 0}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                                <span>Active Requisitions</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <h4 className="text-gray-600 font-medium">Total Vendors</h4>
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mt-4">
                                {eoiItems.length > 0
                                    ? (eoiItems.reduce((sum, item) => sum + item.total_submissions, 0)).toFixed(0)
                                    : 0}
                            </p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                                <span>Participating Vendors</span>
                            </div>
                        </div>
                    </div>

                    {/* EOI Reports Content - Fixed Width Container */}
                    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h4 className="text-lg font-medium text-gray-800 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                EOI Reports Overview
                            </h4>
                        </div>

                        {/* Table Container with fixed layout for the container and horizontal scroll only for the table */}
                        <div className="w-full overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                EOI Number
                                            </th>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                Title
                                            </th>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                Workflow
                                            </th>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                Status
                                            </th>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                Deadline
                                            </th>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                Req.
                                            </th>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                Products
                                            </th>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                Submissions
                                            </th>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                Min. Total Price
                                            </th>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                Avg. Total Price
                                            </th>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                Max. Total Price
                                            </th>
                                            <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {eoiItems.length > 0 ? (
                                            eoiItems.map((eoi) => (
                                                <tr key={eoi.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {eoi.eoi_number || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                        {eoi.title || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                        <div title={eoi.approval_workflow || ''}>
                                                            {eoi.approval_workflow || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(eoi.status)}`}>
                                                            {eoi.status?.replace('_', ' ') || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {formatDate(eoi.submission_deadline)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                                                        {eoi.total_requisitions}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                        <div title={eoi.products || ''}>
                                                            {eoi.products || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                                                        {eoi.total_submissions}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">
                                                        <div>{formatCurrency(eoi.min_total_price)}</div>
                                                        <div className="text-xs text-gray-500 max-w-xs" title={eoi.min_price_vendor}>
                                                            {eoi.min_price_vendor}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {formatCurrency(eoi.avg_total_price)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">
                                                        <div>{formatCurrency(eoi.max_total_price)}</div>
                                                        <div className="text-xs text-gray-500" title={eoi.max_price_vendor}>
                                                            {eoi.max_price_vendor}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button
                                                            onClick={() => {
                                                                if (eoi.id) {
                                                                    setSelectedEoiId(eoi.id);
                                                                    handleGenerateReport();
                                                                }
                                                            }}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150 text-xs font-medium"
                                                            disabled={isLoading && selectedEoiId === eoi.id}
                                                        >
                                                            {isLoading && selectedEoiId === eoi.id ? (
                                                                <span className="flex items-center">
                                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Loading
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                    View Summary
                                                                </span>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={12} className="px-6 py-10 text-center text-gray-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <p className="text-lg font-medium">No EOI reports found</p>
                                                    <p className="mt-1">There are currently no reports available to display.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}