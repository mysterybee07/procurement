import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

interface Entity {
  title: string;
  id: number;
  [key: string]: any;
}

interface ApprovalStep {
  id: number;
  step_number: number;
  step_name: string;
  approver_role: string;
  status?: string;
  action_date?: string | null;
  comments?: string | null;
  delegated_to?: string;
  is_mandatory?: boolean;
}

interface ApprovalItem {
  id: number;
  entity_id: number;
  entity_type: string;
  current_step: ApprovalStep;
  entity: Entity;
  step: ApprovalStep[];
  estimated_budget: number;
  deadline: string;
  status?: string;
  action_date?: string;
}

interface ApproverDashboardProps {
  requestApprovals: ApprovalItem[];
  flash: {
    message?: string;
    error?: string;
  };
}

const ApproverDashboard: React.FC<ApproverDashboardProps> = ({ flash, requestApprovals }) => {
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [completedApprovals, setCompletedApprovals] = useState<ApprovalItem[]>([]);
  const [tab, setTab] = useState<'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Requisitions',
      href: route('requisitions.index')
    },
    {
      title: 'Approval Dashboard',
      href: '#'
    }
  ];

  // Format date to be more readable
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Process the approval data when component mounts
  useEffect(() => {
    try {
      if (requestApprovals) {
        // Filter approvals based on status
        const pending = requestApprovals.filter(item =>
          item.status === 'pending' || !item.status
        );

        const completed = requestApprovals.filter(item =>
          item.status === 'approved' || item.status === 'rejected'
        );

        setPendingApprovals(pending);
        setCompletedApprovals(completed);
      }
    } catch (err) {
      setError('Error processing approval data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [requestApprovals]);

  // Filter approvals based on search term
  const filteredPendingApprovals = pendingApprovals.filter(item =>
    item.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.entity?.title && item.entity.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.current_step?.step_name && item.current_step.step_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.id.toString().includes(searchTerm)
  );

  const filteredCompletedApprovals = completedApprovals.filter(item =>
    item.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.entity?.title && item.entity.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.current_step?.step_name && item.current_step.step_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.id.toString().includes(searchTerm)
  );

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      router.post(route('entity.approve', { entityId: id }), {
        comments: '', // Add any comments you want to send
      }, {
        onSuccess: () => {
          setSuccessMessage('Request approved successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
        },
        onError: (errors) => {
          console.error(errors);
          setError('Failed to approve request');
        }
      });
    } else if (action === 'reject') {
      // Handle the rejection route
      router.post(route('entity.reject', { entityId: id }), {
        comments: '', // Add any comments you want to send for rejection
      }, {
        onSuccess: () => {
          setSuccessMessage('Request rejected successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
        },
        onError: (errors) => {
          console.error(errors);
          setError('Failed to reject request');
        }
      });
    }
  };


  const handleViewDetails = (item: ApprovalItem) => {
    // Implement your view details logic here
    console.log('View details for', item);
  };

  // Render approval cards
  const renderApprovalCards = (approvals: ApprovalItem[]) => {
    return (
      <div className="grid grid-cols-1 gap-4">
        {approvals.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-4 flex justify-between items-center bg-gray-50 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="mr-2">{item.entity?.title || "Untitled Request"}</span>
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Budget</div>
                    <div className="mt-1 text-sm text-gray-900 font-medium">
                      ${item.estimated_budget?.toLocaleString() || '0'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">Deadline</div>
                    <div className="mt-1 text-sm text-gray-900 font-medium">
                      {formatDate(item.deadline)}
                    </div>
                  </div>
                </div>

                {item.step && item.step.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">Approval Progress</div>
                    <div className="flex items-center space-x-2">
                      {item.step.map((step, index) => (
                        <div
                          key={step.id}
                          className={`h-2 flex-1 rounded-full ${step.status === 'approved' ? 'bg-green-500' :
                            step.status === 'rejected' ? 'bg-red-500' :
                              step.step_number < (item.current_step?.step_number || 0) ? 'bg-blue-500' :
                                'bg-gray-200'
                            }`}
                          title={`Step ${step.step_number}: ${step.step_name}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}>
                {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
              </span> */}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
              {tab === 'pending' ? (
                <>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium flex items-center"
                    onClick={() => handleAction(item.id, 'approve')}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Approve
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm font-medium flex items-center"
                    onClick={() => handleAction(item.id, 'reject')}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Reject
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium flex items-center"
                    onClick={() => handleViewDetails(item)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Details
                  </button>
                </>
              ) : (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium flex items-center"
                  onClick={() => handleViewDetails(item)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Approver Dashboard" />

      <div className="py-6">
        <div className="w-full mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Approval Dashboard</h1>
          </div>

          {/* Flash Messages */}
          {flash.message && (
            <div className="mb-4 text-green-600 bg-green-100 border border-green-400 px-4 py-2 rounded-md">
              {flash.message}
            </div>
          )}
          {flash.error && (
            <div className="mb-4 text-red-600 bg-red-100 border border-red-400 px-4 py-2 rounded-md">
              {flash.error}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
                <p className="text-3xl font-bold text-blue-600">{pendingApprovals.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Approved</h2>
                <p className="text-3xl font-bold text-green-600">
                  {completedApprovals.filter(item => item.status === 'approved').length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Rejected</h2>
                <p className="text-3xl font-bold text-red-600">
                  {completedApprovals.filter(item => item.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4">
                <div className="flex mb-4 md:mb-0">
                  <button
                    className={`mr-4 py-2 px-4 rounded-md text-center font-medium text-sm ${tab === 'pending'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    onClick={() => setTab('pending')}
                  >
                    Pending Approvals ({pendingApprovals.length})
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md text-center font-medium text-sm ${tab === 'completed'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    onClick={() => setTab('completed')}
                  >
                    Completed Approvals ({completedApprovals.length})
                  </button>
                </div>

                {/* Search field */}
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-sm"
                    placeholder="Search approvals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : tab === 'pending' ? (
                filteredPendingApprovals.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No pending approvals</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? `No pending approvals match your search "${searchTerm}".` : 'You don\'t have any pending approvals at this time.'}
                    </p>
                  </div>
                ) : (
                  renderApprovalCards(filteredPendingApprovals)
                )
              ) : (
                filteredCompletedApprovals.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No completed approvals</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? `No completed approvals match your search "${searchTerm}".` : 'You don\'t have any completed approvals to display.'}
                    </p>
                  </div>
                ) : (
                  renderApprovalCards(filteredCompletedApprovals)
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ApproverDashboard;