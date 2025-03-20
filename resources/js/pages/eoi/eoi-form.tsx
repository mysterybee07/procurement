import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Bold, Italic, List, Link, Image, Calendar } from 'lucide-react';
import DocumentModalForm from '../document/document-form'
import DirectRequisitionModal from '../procurement/procurement-modal';

interface ApprovalWorkflow {
  id: number;
  name: string;
}

interface Document {
  id: number;
  name: string;
}
interface Product {
  id: number;
  name: string;
}

interface EOIFormData {
  id: number;
  title: string;
  description: string;
  submission_date: string;
  status: string;
  current_approval_step: string;
  approval_workflow_id: number;
  document_id: number;
  submission_deadline: string;
  evaluation_criteria: string;
  eoi_number: string;
  allow_partial_item_submission: boolean;
  selected_documents: number[];
  [key: string]: any;
}

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

interface Props {
  approvalWorkflows: ApprovalWorkflow[];
  requiredDocuments: Document[];
  products: Product[],
  isEditing: boolean;
  eoi?: {
    id?: number;
    title?: string;
    description?: string;
    document_id?: number;
    submission_date?: string;
    status?: string;
    current_approval_step?: string;
    approval_workflow_id?: number;
    submission_deadline?: string;
    evaluation_criteria?: string;
    eoi_number?: string;
    allow_partial_item_submission?: boolean;
    selected_documents?: number[];
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

const EOIForm: React.FC<Props> = ({ approvalWorkflows, products, requiredDocuments: initialDocuments, isEditing, eoi }) => {
  // State for managing documents (including newly created ones)
  const [documents, setDocuments] = useState<Document[]>(initialDocuments || []);

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
    submission_date: '',
    status: 'draft',
    current_approval_step: '',
    approval_workflow_id: 0,
    document_id: 0,
    submission_deadline: '',
    evaluation_criteria: '',
    eoi_number: '',
    allow_partial_item_submission: false,
    selected_documents: [],
  });

  // Load EOI data when editing
  useEffect(() => {
    if (isEditing && eoi) {
      setData({
        id: eoi.id || 0,
        title: eoi.title || '',
        description: eoi.description || '',
        document_id: eoi.document_id || 0,
        submission_date: eoi.submission_date || '',
        status: eoi.status || 'draft',
        current_approval_step: eoi.current_approval_step || '',
        approval_workflow_id: eoi.approval_workflow_id || 0,
        submission_deadline: eoi.submission_deadline || '',
        evaluation_criteria: eoi.evaluation_criteria || '',
        eoi_number: eoi.eoi_number || '',
        allow_partial_item_submission: eoi.allow_partial_item_submission || false,
        selected_documents: eoi.selected_documents || [],
      });
    }
  }, [isEditing, eoi]);

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

  const handleDocumentToggle = (documentId: number) => {
    setData('selected_documents',
      data.selected_documents.includes(documentId)
        ? data.selected_documents.filter(id => id !== documentId)
        : [...data.selected_documents, documentId]
    );
  };

  // Handle new document creation success
  const handleDocumentCreated = (newDocument: Document) => {
    // Add the new document to the list
    setDocuments([...documents, newDocument]);

    // Automatically select the newly created document
    setData('selected_documents', [...data.selected_documents, newDocument.id]);
  };

  // Form submission handlers
  const handleSubmit = (e: React.FormEvent, status: 'draft' | 'submitted') => {
    e.preventDefault();
    setData('status', status);

    const url = isEditing ? `/eois/${data.id}?_method=PUT` : '/eois';

    post(url, {
      onSuccess: () => {
        reset();
      },
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

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
                  <label className="block text-sm font-medium mb-1">Approval Workflow</label>
                  <select
                    name="approval_workflow_id"
                    value={data.approval_workflow_id}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option>Select a workflow</option>
                    <option>high value workflow</option>
                    {/* {approvalWorkflows.map((workflow) => (
                      <option key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </option>
                    ))} */}
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
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Required Documents</h3>
                  <DocumentModalForm
                    isEditing={false}
                    buttonLabel="Add New Document"
                  // onSuccess={handleDocumentCreated}
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="h-32 overflow-y-auto">
                    {documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {documents.map((document) => (
                          <div
                            key={document.id}
                            className={`
                              p-3 rounded-md border transition-all duration-200
                              ${data.selected_documents.includes(document.id)
                                ? 'bg-indigo-50 border-indigo-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'}
                            `}
                          >
                            <label className="flex items-start cursor-pointer">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  checked={data.selected_documents.includes(document.id)}
                                  onChange={() => handleDocumentToggle(document.id)}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <span className={`font-medium ${data.selected_documents.includes(document.id) ? 'text-indigo-700' : 'text-gray-700'}`}>
                                  {document.name}
                                </span>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-4">
                        <p className="text-gray-500 text-sm">Ask For Documents.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-4">

                <div className="flex justify-between">
                  <div>
                  {/* <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"

                  >Add Products
                  </button> */}

                  <DirectRequisitionModal
                    onSuccess={() => { }}
                    products={products}
                  />
                  </div>
                  <div className='flex justify-between'>
                  <input
                    type="checkbox"
                    id="allow_partial_item_submission"
                    name="allow_partial_item_submission"
                    checked={data.allow_partial_item_submission}
                    onChange={handleCheckboxChange}
                    className="w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="allow_partial_item_submission" className="ml-2 pt-2 block text-l text-gray-900">
                    Allow Partial Item Submission
                  </label>
                </div>
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
                  onClick={(e) => handleSubmit(e, data.status as 'draft' | 'submitted')}
                  disabled={processing}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Updating...' : 'Update EOI'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'draft')}
                    disabled={processing}
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    {processing ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'submitted')}
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