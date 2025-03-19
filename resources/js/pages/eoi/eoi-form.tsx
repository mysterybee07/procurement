import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Bold, Italic, List, Link, Image, PlusCircle, Calendar } from 'lucide-react';

interface ApprovalWorkflow {
  id: number;
  name: string;
}

interface EOIFormData {
  id: number;
  title: string;
  description: string;
  estimated_budget: string;
  submission_date: string;
  status: string;
  current_approval_step: string;
  approval_workflow_id: number;
  submission_deadline: string;
  evaluation_criteria: string;
  eoi_number: string;
  allow_partial_item_submission: boolean;
  [key: string]: any;
}

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

interface Props {
  approvalWorkflows: ApprovalWorkflow[];
  isEditing: boolean;
  eoi?: {
    id?: number;
    title?: string;
    description?: string;
    estimated_budget?: string;
    submission_date?: string;
    status?: string;
    current_approval_step?: string;
    approval_workflow_id?: number;
    submission_deadline?: string;
    evaluation_criteria?: string;
    eoi_number?: string;
    allow_partial_item_submission?: boolean;
  }
}

const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="border rounded">
      <div className="flex gap-2 p-2 border-b bg-gray-50">
        <button className="p-1 hover:bg-gray-200 rounded" title="Bold">
          <Bold size={16} />
        </button>
        <button className="p-1 hover:bg-gray-200 rounded" title="Italic">
          <Italic size={16} />
        </button>
        <button className="p-1 hover:bg-gray-200 rounded" title="Bullet List">
          <List size={16} />
        </button>
        <button className="p-1 hover:bg-gray-200 rounded" title="Insert Link">
          <Link size={16} />
        </button>
        <button className="p-1 hover:bg-gray-200 rounded" title="Insert Image">
          <Image size={16} />
        </button>
      </div>
      <textarea
        value={value}
        onChange={onChange}
        className="w-full p-2 min-h-24 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
};

const EOIForm: React.FC<Props> = ({ approvalWorkflows, isEditing, eoi }) => {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Expressions of Interest',
      href: '/eois',
    },
    {
      title: isEditing ? 'Edit EOI' : 'Create EOI',
      href: isEditing ? `/eois/${eoi?.id}/edit` : '/eois/create',
    },
  ];

  // Form initialization
  const { data, setData, post, errors, processing, reset } = useForm<EOIFormData>({
    id: 0,
    title: '',
    description: '',
    estimated_budget: '',
    submission_date: '',
    status: 'draft',
    current_approval_step: '',
    approval_workflow_id: 0,
    submission_deadline: '',
    evaluation_criteria: '',
    eoi_number: '',
    allow_partial_item_submission: false,
  });

  // Generate EOI number
  useEffect(() => {
    if (!isEditing) {

    }
  }, [isEditing]);

  // Load EOI data when editing
  useEffect(() => {
    if (isEditing && eoi) {
      setData({
        id: eoi.id || 0,
        title: eoi.title || '',
        description: eoi.description || '',
        estimated_budget: eoi.estimated_budget || '',
        submission_date: eoi.submission_date || '',
        status: eoi.status || 'draft',
        current_approval_step: eoi.current_approval_step || '',
        approval_workflow_id: eoi.approval_workflow_id || 0,
        submission_deadline: eoi.submission_deadline || '',
        evaluation_criteria: eoi.evaluation_criteria || '',
        eoi_number: eoi.eoi_number || '',
        allow_partial_item_submission: eoi.allow_partial_item_submission || false,
      });
    }
  }, [isEditing, eoi]);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionType, setSubmissionType] = useState<'draft' | 'submitted' | 'updated'>('draft');

  // Handle form submission
  useEffect(() => {
    if (isSubmitting) {
      if (isEditing) {
        post(`/eois/${data.id}?_method=PUT`, {
          onSuccess: () => {
            reset();
            setIsSubmitting(false);
          },
        });
      } else {
        post('/eois', {
          onSuccess: () => {
            reset();
            setIsSubmitting(false);
          },
        });
      }
    }
  }, [isSubmitting]);

  // Form input handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData(name as keyof EOIFormData, value);
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;
    setData(name as keyof EOIFormData, checked);
  };

  // Form submission handlers
  const saveAsDraft = (e: React.FormEvent) => {
    e.preventDefault();
    setData('status', 'draft');
    setSubmissionType('draft');
    setIsSubmitting(true);
  };

  const submitForApproval = (e: React.FormEvent) => {
    e.preventDefault();
    setData('status', 'submitted');
    setSubmissionType('submitted');
    setIsSubmitting(true);
  };

  const updateEOI = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionType('updated');
    setIsSubmitting(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Expression of Interest' : 'Create New Expression of Interest'}</h1>

          <form>
            {/* EOI Details Section */}
            <div className="mb-8 p-6 border rounded-lg bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">EOI Details</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">EOI Title*</label>
                <input
                  type="text"
                  name="title"
                  value={data.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <SimpleRichTextEditor
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Enter a detailed description of this EOI..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Estimated Budget</label>
                  <input
                    type="number"
                    name="estimated_budget"
                    value={data.estimated_budget}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    step="0.01"
                  />
                  {errors.estimated_budget && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimated_budget}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Approval Workflow</label>
                  <select
                    name="approval_workflow_id"
                    value={data.approval_workflow_id}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value={0}>Select a workflow</option>
                    {/* {approvalWorkflows.map((workflow) => (
                      <option key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </option>
                    ))} */}
                    <option value="high value workflow">high value workflow</option>
                  </select>
                  {errors.approval_workflow_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.approval_workflow_id}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Submission Date*</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="submission_date"
                      value={data.submission_date}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                    <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  {errors.submission_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.submission_date}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Submission Deadline</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="submission_deadline"
                      value={data.submission_deadline}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                    <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  {errors.submission_deadline && (
                    <p className="mt-1 text-sm text-red-600">{errors.submission_deadline}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Evaluation Criteria</label>
                <SimpleRichTextEditor
                  value={data.evaluation_criteria}
                  onChange={(e) => setData('evaluation_criteria', e.target.value)}
                  placeholder="Enter evaluation criteria for this EOI..."
                />
                {errors.evaluation_criteria && (
                  <p className="mt-1 text-sm text-red-600">{errors.evaluation_criteria}</p>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allow_partial_item_submission"
                    name="allow_partial_item_submission"
                    checked={data.allow_partial_item_submission}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="allow_partial_item_submission" className="ml-2 block text-sm text-gray-900">
                    Allow Partial Item Submission
                  </label>
                </div>
                {errors.allow_partial_item_submission && (
                  <p className="mt-1 text-sm text-red-600">{errors.allow_partial_item_submission}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              {isEditing ? (
                <button
                  type="button"
                  onClick={updateEOI}
                  disabled={processing}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Updating...' : 'Update EOI'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={saveAsDraft}
                    disabled={processing}
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    {processing ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={submitForApproval}
                    disabled={processing}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {processing ? 'Submitting...' : 'Submit for Approval'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default EOIForm;