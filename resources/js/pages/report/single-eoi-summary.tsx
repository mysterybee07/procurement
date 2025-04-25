import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface EOIOverview {
  id: number;
  eoi_number: string;
  title: string;
  status: string;
  publish_date: string | null;
  submission_deadline: string | null;
  created_at: string;
  total_submissions: number;
  shortlisted_submissions: number;
  linked_requisitions: number;
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
  best_vendor: string;
}

interface EOIApprovalTimeline {
  status: string;
  comments: string | null;
  action_date: string | null;
  approver_name: string;
  step_name: string | null;
}

interface EOIData {
  overview: EOIOverview;
  submissions: EOISubmission[];
  comparisons: EOIItemComparison[];
  timeline: EOIApprovalTimeline[];
}

interface Props extends PageProps {
  eoiData: EOIData;
}

export default function EOIReportShow({ eoiData }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Early return if overview data is missing
  if (!eoiData.overview) {
    return (
      <AppLayout>
        <div className="py-6 bg-gray-50 min-h-screen">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-center text-gray-500">No EOI data available</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleExportToExcel = () => {
    setIsLoading(true);
    window.location.href = route('reports.eoi.export', { eoi_id: eoiData.overview.id });
  };

  const handlePrintReport = () => {
    setIsLoading(true);
    window.location.href = route('reports.eoi.print', { eoi_id: eoiData.overview.id });
  };

  const navigateToOverallReport = () => {
    router.visit(route('reports.eoi.index'));
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
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const statusColor = (status: string | undefined | null) => {
    // Handle undefined or null status
    if (!status) return 'bg-gray-100 text-gray-800';

    const statusLower = status.toLowerCase();

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

    return colors[statusLower] || 'bg-gray-100 text-gray-800';
  };

  // Safely format status text
  const formatStatus = (status: string | undefined | null) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ');
  };

  return (
    <AppLayout>
      <Head title={`EOI Report - ${eoiData.overview.eoi_number}`} />

      <div className="py-6 bg-gray-50 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Summary of {eoiData.overview.eoi_number}</h1>
            <button
              onClick={navigateToOverallReport}
              className="flex items-center text-blue-600 hover:text-blue-900 transition duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to All Reports
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div>
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                      <h2 className="text-xl font-bold text-gray-800">{eoiData.overview.title}</h2>
                      <div className="flex items-center mt-2 mb-4">
                        <span className="text-gray-600 text-sm mr-3">{eoiData.overview.eoi_number}</span>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(eoiData.overview.status)}`}>
                          {formatStatus(eoiData.overview.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Published Date</p>
                          <p className="font-medium">{formatDate(eoiData.overview.publish_date)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Submission Deadline</p>
                          <p className="font-medium">{formatDate(eoiData.overview.submission_deadline)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Submissions</p>
                          <p className="font-medium">{eoiData.overview.total_submissions}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Shortlisted</p>
                          <p className="font-medium">{eoiData.overview.shortlisted_submissions}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-none md:w-80 bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Actions</h3>
                      <div className="space-y-3">
                        <button
                          className="w-full flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-150"
                          onClick={handleExportToExcel}
                          disabled={isLoading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export to Excel
                        </button>
                        <button
                          className="w-full flex items-center justify-center px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-150"
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
                  </div>
                </div>

                {/* Vendor Submissions */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Vendor Submissions</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                      {eoiData.submissions.length} Submissions
                    </span>
                  </div>
                  <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shortlisted</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {eoiData.submissions && eoiData.submissions.length > 0 ? (
                            eoiData.submissions.map((sub) => (
                              <tr key={sub.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">{sub.vendor_name}</div>
                                  <div className="text-sm text-gray-500">{sub.vendor_email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(sub.status)}`}>
                                    {formatStatus(sub.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {formatDate(sub.submission_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                  {formatCurrency(sub.items_total_price)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {sub.items_submitted}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {sub.is_shortlisted ? (
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                      No
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                No submissions found for this EOI
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Item Price Comparison */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Item Price Comparison</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                      {eoiData.comparisons.length} Items
                    </span>
                  </div>
                  <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Qty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offers</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Offered</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {eoiData.comparisons && eoiData.comparisons.length > 0 ? (
                            eoiData.comparisons.map((item) => (
                              <tr key={item.request_item_id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.product_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {item.required_quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {item.vendor_offers}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                  {formatCurrency(item.min_unit_price)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                  {formatCurrency(item.avg_unit_price)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                  {formatCurrency(item.max_unit_price)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {item.best_vendor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {item.total_offered_quantity}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                No item comparisons available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Approval Timeline */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Approval Timeline</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                      {eoiData.timeline.length} Steps
                    </span>
                  </div>
                  <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Step</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approver</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {eoiData.timeline && eoiData.timeline.length > 0 ? (
                            eoiData.timeline.map((step, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {step.step_name || `Step ${index + 1}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(step.status)}`}>
                                    {formatStatus(step.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {step.approver_name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {step.action_date ? formatDate(step.action_date) : 'Pending'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {step.comments || 'N/A'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                No approval history available
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
}