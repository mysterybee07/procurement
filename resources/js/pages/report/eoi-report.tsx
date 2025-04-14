import { Head, router } from '@inertiajs/react';
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
  best_vendor: string;
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
  stats: {
    total_eois: number;
    total_vendors: number;
    total_requisitions: number;
  };
}

export default function EOIReports({
  overview,
  submissions = [],
  comparisons = [],
  timeline = [],
  eoi_id,
  stats,
}: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>(eoi_id ? 'details' : 'overview');
  const [selectedEoiId, setSelectedEoiId] = useState<number | null>(eoi_id || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedEoi = overview.find(e => e.id === selectedEoiId) || null;

  const handleGenerateReport = () => {
    if (selectedEoiId) {
      setIsLoading(true);
      setActiveTab('details');
      router.get(route('reports.eoi', { eoi_id: selectedEoiId }), {}, {
        onFinish: () => setIsLoading(false)
      });
    }
  };

  const handleExportToExcel = () => {
    if (selectedEoiId) {
      window.location.href = route('reports.eoi.export', { eoi_id: selectedEoiId });
    }
  };

  const handlePrintReport = () => {
    if (selectedEoiId) {
      window.location.href = route('reports.eoi.print', { eoi_id: selectedEoiId });
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
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

  // Calculate completion percentage for progress bar
  const getCompletionPercentage = () => {
    if (!timeline.length) return 0;
    const completedSteps = timeline.filter(step => step.action_date).length;
    return Math.round((completedSteps / timeline.length) * 100);
  };

  return (
    <AppLayout>
      <Head title="EOI Reports" />

      <div className="py-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">EOI Reports Dashboard</h1>
            {activeTab === 'details' && selectedEoi && (
              <button
                onClick={() => setActiveTab('overview')}
                className="flex items-center text-blue-600 hover:text-blue-900 transition duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Overview
              </button>
            )}
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  className={`whitespace-nowrap py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } transition duration-150`}
                  onClick={() => setActiveTab('overview')}
                >
                  EOI Overview
                </button>
                {eoi_id && (
                  <button
                    className={`whitespace-nowrap py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'details'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } transition duration-150`}
                    onClick={() => setActiveTab('details')}
                  >
                    EOI Details
                  </button>
                )}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-sm border border-blue-200 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <h4 className="text-gray-600 text-sm font-medium">Total EOIs</h4>
                        <div className="bg-blue-500 bg-opacity-20 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                            <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-blue-700 mt-2">{stats.total_eois}</p>
                      <p className="text-sm text-gray-500 mt-2">Expressions of Interest</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-sm border border-green-200 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <h4 className="text-gray-600 text-sm font-medium">Total Vendors</h4>
                        <div className="bg-green-500 bg-opacity-20 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-green-700 mt-2">{stats.total_vendors}</p>
                      <p className="text-sm text-gray-500 mt-2">Participating vendors</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 shadow-sm border border-purple-200 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <h4 className="text-gray-600 text-sm font-medium">Total Requisitions</h4>
                        <div className="bg-purple-500 bg-opacity-20 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-purple-700 mt-2">{stats.total_requisitions}</p>
                      <p className="text-sm text-gray-500 mt-2">Linked requisitions</p>
                    </div>
                  </div>

                  {/* EOI Selection */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
                    <h4 className="text-lg font-medium mb-6 text-gray-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                      </svg>
                      Generate EOI Report
                    </h4>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-grow">
                        <label htmlFor="eoi-select" className="block text-sm font-medium text-gray-700 mb-2">
                          Select EOI to generate detailed report
                        </label>
                        <select
                          id="eoi-select"
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          value={selectedEoiId || ''}
                          onChange={(e) => setSelectedEoiId(e.target.value ? parseInt(e.target.value) : null)}
                        >
                          <option value="">-- Select an EOI --</option>
                          {overview.map((eoi) => (
                            <option key={eoi.id} value={eoi.id}>
                              {eoi.eoi_number} - {eoi.title} ({eoi.status.replace('_', ' ')})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleGenerateReport}
                          disabled={!selectedEoiId || isLoading}
                          className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200 ${!selectedEoiId || isLoading
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 shadow hover:shadow-md'
                            }`}
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                              </svg>
                              Generate Report
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent EOIs Table */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-medium mb-6 text-gray-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Recent EOIs
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EOI Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {overview.slice(0, 5).map((eoi) => (
                            <tr key={eoi.id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {eoi.eoi_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {eoi.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(eoi.status)}`}>
                                  {eoi.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {formatDate(eoi.submission_deadline)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {eoi.total_submissions} <span className="text-gray-400">/ {eoi.shortlisted_submissions} shortlisted</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => {
                                    setSelectedEoiId(eoi.id);
                                    handleGenerateReport();
                                  }}
                                  className="text-blue-600 hover:text-blue-900 font-medium transition duration-150"
                                >
                                  View Report
                                </button>
                              </td>
                            </tr>
                          ))}
                          {overview.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                No EOIs found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'details' && selectedEoi && (
                <div>
                  <div className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1 bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">{selectedEoi.title}</h2>
                        <div className="flex items-center mt-2 mb-4">
                          <span className="text-gray-600 text-sm mr-3">{selectedEoi.eoi_number}</span>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(selectedEoi.status)}`}>
                            {selectedEoi.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Published Date</p>
                            <p className="font-medium">{formatDate(selectedEoi.publish_date)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Submission Deadline</p>
                            <p className="font-medium">{formatDate(selectedEoi.submission_deadline)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total Submissions</p>
                            <p className="font-medium">{selectedEoi.total_submissions}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Shortlisted</p>
                            <p className="font-medium">{selectedEoi.shortlisted_submissions}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-none md:w-80 bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Actions</h3>
                        <div className="space-y-3">
                          <button
                            className="w-full flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-150"
                            onClick={handleExportToExcel}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export to Excel
                          </button>
                          <button
                            className="w-full flex items-center justify-center px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-150"
                            onClick={handlePrintReport}
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
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">{submissions.length} Submissions</span>
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
                            {submissions.map((sub) => (
                              <tr key={sub.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">{sub.vendor_name}</div>
                                  <div className="text-sm text-gray-500">{sub.vendor_email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(sub.status)}`}>
                                    {sub.status.replace('_', ' ')}
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
                            ))}
                            {submissions.length === 0 && (
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
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">{comparisons.length} Items</span>
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
                            {comparisons.map((item) => (
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
                            ))}
                            {comparisons.length === 0 && (
                              <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
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
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">{timeline.length} Steps</span>
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
                            {timeline.map((step, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {step.step_name || `Step ${index + 1}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(step.status)}`}>
                                    {step.status}
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
                            ))}
                            {timeline.length === 0 && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}