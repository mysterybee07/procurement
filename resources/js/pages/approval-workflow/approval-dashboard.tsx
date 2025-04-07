import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, FileText, User, Calendar } from 'lucide-react';

// Define types for our data model
interface ApprovalStep {
  id: number;
  step_number: number;
  step_name: string;
  approver_role: string;
  status?: 'approved' | 'rejected' | 'pending' | 'not_started';
  completed_by?: string | null;
  completed_date?: string | null;
  comments?: string | null;
  delegated_to?: string;
  is_mandatory?: boolean;
  allow_delegation?: boolean;
}

interface Workflow {
  id: number;
  workflow_name: string;
  approval_workflow_type: 'sequential' | 'parallel';
}

interface ApprovalItem {
  id: number;
  entity_id: number;
  entity_type: string;
  entity_name: string;
  eoi_number: string;
  created_date: string;
  current_step: ApprovalStep;
  workflow: Workflow;
  steps: ApprovalStep[];
  estimated_budget: number;
  deadline: string;
  status?: 'approved' | 'rejected';
  action_date?: string;
}

interface Delegate {
  id: number;
  name: string;
  role: string;
}

const ApproverDashboard: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [completedApprovals, setCompletedApprovals] = useState<ApprovalItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [comment, setComment] = useState<string>('');
  const [delegateUser, setDelegateUser] = useState<string>('');
  const [availableDelegates, setAvailableDelegates] = useState<Delegate[]>([]);
  const [tab, setTab] = useState<'pending' | 'completed'>('pending');

  // Simulated data - replace with API calls in production
  useEffect(() => {
    const fetchApprovals = async (): Promise<void> => {
      // Simulated pending approvals
      const mockPendingApprovals: ApprovalItem[] = [
        {
          id: 1,
          entity_id: 101,
          entity_type: 'eoi',
          entity_name: 'IT Infrastructure Upgrade EOI',
          eoi_number: 'EOI-2025-0042',
          created_date: '2025-04-01T10:30:00',
          current_step: {
            id: 3,
            step_number: 2,
            step_name: 'Finance Approval',
            approver_role: 'FINANCE_DIR',
            is_mandatory: true,
            allow_delegation: true
          },
          workflow: {
            id: 1,
            workflow_name: 'High Value EOI Approval',
            approval_workflow_type: 'sequential'
          },
          steps: [
            { 
              id: 2, 
              step_number: 1, 
              step_name: 'Department Manager Review', 
              approver_role: 'DEPT_MANAGER',
              status: 'approved',
              completed_by: 'John Smith',
              completed_date: '2025-04-02T14:22:00',
              comments: 'Scope and budget are aligned with department goals'
            },
            { 
              id: 3, 
              step_number: 2, 
              step_name: 'Finance Approval', 
              approver_role: 'FINANCE_DIR',
              status: 'pending',
              completed_by: null,
              completed_date: null,
              comments: null
            },
            { 
              id: 4, 
              step_number: 3, 
              step_name: 'Executive Approval', 
              approver_role: 'EXECUTIVE',
              status: 'not_started',
              completed_by: null,
              completed_date: null,
              comments: null
            }
          ],
          estimated_budget: 175000,
          deadline: '2025-05-15'
        }
      ];

      // Simulated completed approvals
      const mockCompletedApprovals: ApprovalItem[] = [
        {
          id: 3,
          entity_id: 100,
          entity_type: 'eoi',
          entity_name: 'Software Development Services EOI',
          eoi_number: 'EOI-2025-0040',
          created_date: '2025-03-25T11:20:00',
          status: 'approved',
          action_date: '2025-03-28T15:45:00',
          current_step: {
            id: 8,
            step_number: 2,
            step_name: 'Finance Approval',
            approver_role: 'FINANCE_DIR',
            is_mandatory: true,
            allow_delegation: false
          },
          workflow: {
            id: 2,
            workflow_name: 'Standard EOI Approval',
            approval_workflow_type: 'sequential'
          },
          steps: [
            { 
              id: 7, 
              step_number: 1, 
              step_name: 'Department Manager Review', 
              approver_role: 'DEPT_MANAGER',
              status: 'approved',
              completed_by: 'John Smith',
              completed_date: '2025-03-26T10:15:00',
              comments: 'Looks good, requirements are clear'
            },
            { 
              id: 8, 
              step_number: 2, 
              step_name: 'Finance Approval', 
              approver_role: 'FINANCE_DIR',
              status: 'approved',
              completed_by: 'Jane Doe',
              completed_date: '2025-03-28T15:45:00',
              comments: 'Budget approved'
            }
          ],
          estimated_budget: 45000,
          deadline: '2025-04-15'
        }
      ];

      setPendingApprovals(mockPendingApprovals);
      setCompletedApprovals(mockCompletedApprovals);
      setAvailableDelegates([
        { id: 201, name: 'Alice Johnson', role: 'FINANCE_MANAGER' },
        { id: 202, name: 'Bob Williams', role: 'FINANCE_ANALYST' },
        { id: 203, name: 'Carol Davis', role: 'FINANCE_DIRECTOR' }
      ]);
    };

    fetchApprovals();
  }, []);

  const handleApprove = (): void => {
    if (!selectedItem) return;
    
    const updatedItem = JSON.parse(JSON.stringify(selectedItem)) as ApprovalItem;
    const updatedStep = updatedItem.steps.find(
      step => step.id === updatedItem.current_step.id
    );
    
    if (!updatedStep) return;
    
    updatedStep.status = 'approved';
    updatedStep.comments = comment;
    updatedStep.completed_by = 'Current User';
    updatedStep.completed_date = new Date().toISOString();

    if (updatedItem.workflow.approval_workflow_type === 'sequential') {
      const currentStepIndex = updatedItem.steps.findIndex(
        step => step.id === updatedItem.current_step.id
      );
      
      if (currentStepIndex < updatedItem.steps.length - 1) {
        const nextStep = updatedItem.steps[currentStepIndex + 1];
        nextStep.status = 'pending';
        updatedItem.current_step = nextStep;
      } else {
        const updatedPendingApprovals = pendingApprovals.filter(
          item => item.id !== updatedItem.id
        );
        setPendingApprovals(updatedPendingApprovals);
        setCompletedApprovals([...completedApprovals, {...updatedItem, status: 'approved'}]);
        setSelectedItem(null);
        setComment('');
        return;
      }
    }

    const updatedPendingApprovals = pendingApprovals.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    
    setPendingApprovals(updatedPendingApprovals);
    setSelectedItem(updatedItem);
    setComment('');
  };

  const handleReject = (): void => {
    if (!selectedItem || !comment) return;
    
    const updatedItem = JSON.parse(JSON.stringify(selectedItem)) as ApprovalItem;
    const updatedStep = updatedItem.steps.find(
      step => step.id === updatedItem.current_step.id
    );
    
    if (!updatedStep) return;
    
    updatedStep.status = 'rejected';
    updatedStep.comments = comment;
    updatedStep.completed_by = 'Current User';
    updatedStep.completed_date = new Date().toISOString();

    const updatedPendingApprovals = pendingApprovals.filter(
      item => item.id !== updatedItem.id
    );
    setPendingApprovals(updatedPendingApprovals);
    setCompletedApprovals([...completedApprovals, {...updatedItem, status: 'rejected'}]);
    
    setSelectedItem(null);
    setComment('');
  };

  const handleDelegate = (): void => {
    if (!selectedItem || !delegateUser) return;
    
    const updatedItem = JSON.parse(JSON.stringify(selectedItem)) as ApprovalItem;
    const updatedStep = updatedItem.steps.find(
      step => step.id === updatedItem.current_step.id
    );
    
    if (!updatedStep) return;
    
    updatedStep.delegated_to = delegateUser;
    
    const updatedPendingApprovals = pendingApprovals.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    
    setPendingApprovals(updatedPendingApprovals);
    setSelectedItem(null);
    setDelegateUser('');
  };

  const getStatusBadge = (status: string | undefined): JSX.Element => {
    switch(status) {
      case 'approved':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'pending':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Not Started</span>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Approval Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                tab === 'pending' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setTab('pending')}
            >
              Pending Approvals
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                tab === 'completed' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setTab('completed')}
            >
              Completed Approvals
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          {tab === 'pending' ? (
            pendingApprovals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No pending approvals at this time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EOI Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Step</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingApprovals.map((item) => {
                      const currentStepStatus = item.steps.find(s => s.id === item.current_step.id)?.status || 'pending';
                      return (
                        <tr 
                          key={item.id}
                          className={`${selectedItem?.id === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'} cursor-pointer`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.eoi_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.entity_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.current_step.step_name}
                            {getStatusBadge(currentStepStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${item.estimated_budget.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                              {new Date(item.deadline).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            completedApprovals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No completed approvals to display.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EOI Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedApprovals.map((item) => {
                      const completedBy = item.steps.find(s => s.id === item.current_step.id)?.completed_by || 'N/A';
                      return (
                        <tr 
                          key={item.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedItem(item)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.eoi_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.entity_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {completedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.action_date ? new Date(item.action_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
      
      {selectedItem && (
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedItem.entity_name}
            </h2>
            <button 
              onClick={() => setSelectedItem(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">EOI Details</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">EOI Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedItem.eoi_number}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(selectedItem.created_date).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Estimated Budget</dt>
                    <dd className="mt-1 text-sm text-gray-900">${selectedItem.estimated_budget.toLocaleString()}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(selectedItem.deadline).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Workflow Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedItem.workflow.workflow_name}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Approval Steps</h3>
                <ol className="relative border-l border-gray-200 ml-3">
                  {selectedItem.steps.map((step) => (
                    <li key={step.id} className="mb-6 ml-6">
                      <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white
                        ${step.status === 'approved' ? 'bg-green-100' : 
                          step.status === 'rejected' ? 'bg-red-100' : 
                          step.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        {step.status === 'approved' ? <CheckCircle className="w-3 h-3 text-green-800" /> : 
                          step.status === 'rejected' ? <XCircle className="w-3 h-3 text-red-800" /> : 
                          step.status === 'pending' ? <Clock className="w-3 h-3 text-yellow-800" /> : 
                          <AlertTriangle className="w-3 h-3 text-gray-800" />}
                      </span>
                      <h4 className="flex items-center mb-1 text-sm font-semibold text-gray-900">
                        {step.step_name}
                        <span className="ml-2">{getStatusBadge(step.status)}</span>
                      </h4>
                      {step.completed_by && (
                        <p className="mb-2 text-xs font-normal text-gray-500">
                          <span className="font-medium text-gray-700">{step.completed_by}</span> on {new Date(step.completed_date || '').toLocaleString()}
                        </p>
                      )}
                      {step.comments && (
                        <p className="mb-2 text-sm italic text-gray-600">
                          "{step.comments}"
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            
            {tab === 'pending' && selectedItem.steps.find(s => s.id === selectedItem.current_step.id)?.status === 'pending' && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Actions</h3>
                
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    className="shadow-sm block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your comments or feedback here..."
                  />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleApprove}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </button>
                  
                  <button
                    onClick={handleReject}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={!comment}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </button>
                  
                  {selectedItem.current_step.allow_delegation && (
                    <div className="inline-flex items-center">
                      <select
                        className="mx-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={delegateUser}
                        onChange={(e) => setDelegateUser(e.target.value)}
                      >
                        <option value="">Select delegate</option>
                        {availableDelegates.map((user) => (
                          <option key={user.id} value={user.name}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                      </select>
                      
                      <button
                        onClick={handleDelegate}
                        disabled={!delegateUser}
                        className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Delegate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-6 border-t border-gray-200 pt-6">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  alert(`Viewing full details for ${selectedItem.entity_name}`);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Full EOI Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproverDashboard;