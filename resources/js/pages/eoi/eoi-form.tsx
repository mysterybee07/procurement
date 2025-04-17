import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Bold, Italic, List, Link, Image, Calendar } from 'lucide-react';
import DocumentModalForm from '../document/document-form'
import DirectRequisitionModal from '../requisition/requisition-modal';

interface Document {
  id: number;
  name: string;
}
interface Product {
  id: number;
  name: string;
}

interface Requisition {
  id: number;
}

interface EOIFormData {
  id: number;
  title: string;
  description: string;
  status: string;
  document_id: number;
  evaluation_criteria: string;
  eoi_number: string;
  allow_partial_item_submission: boolean;
  documents: number[];
  requisition_ids: number[];
  [key: string]: any;
}

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

interface Props {
  requiredDocuments: Document[];
  products: Product[],
  isEditing: boolean;
  eoi?: {
    id?: number;
    title?: string;
    description?: string;
    document_id?: number;
    status?: string;
    evaluation_criteria?: string;
    eoi_number?: string;
    allow_partial_item_submission?: boolean;
    documents?: number[];
    requisition_ids?: number[];
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

const EOIForm: React.FC<Props> = ({ products, requiredDocuments: initialDocuments, isEditing, eoi }) => {

  const [requisitionIds, setRequisitionIds] = useState<number[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [documents, setDocuments] = useState<Document[]>(initialDocuments || []);

  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

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

  // Form initialization with documents array and requisition_ids
  const { data, setData, post, errors, processing, reset } = useForm<EOIFormData>({
    id: 0,
    title: '',
    description: '',
    status: 'draft',
    // approval_workflow_id: 0,
    document_id: 0,
    evaluation_criteria: '',
    eoi_number: '',
    allow_partial_item_submission: false,
    documents: [],
    requisition_ids: [],
  });

  // Get requisition IDs from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ids: number[] = [];

    for (const [key, value] of urlParams.entries()) {
      if (key.startsWith("requisition_ids[")) {
        ids.push(Number(value));
      }
    }

    setRequisitionIds(ids);

    // Also set in form data
    setData('requisition_ids', ids);
  }, []);

  // Load EOI data when editing
  useEffect(() => {
    if (isEditing && eoi) {
      const documentIds = Array.isArray(eoi.documents)
        ? eoi.documents.map(doc => typeof doc === 'object' ? doc.id : doc)
        : [];

      const reqIds = eoi.requisition_ids ||
        (Array.isArray(eoi.requisitions) ? eoi.requisitions.map(req => req.id) : []);

      setData({
        id: eoi.id || 0,
        title: eoi.title || '',
        description: eoi.description || '',
        document_id: eoi.document_id || 0,
        status: eoi.status || 'draft',
        evaluation_criteria: eoi.evaluation_criteria || '',
        eoi_number: eoi.eoi_number || '',
        allow_partial_item_submission: eoi.allow_partial_item_submission || false,
        documents: documentIds,
        requisition_ids: reqIds,
      });

      // Set the requisition IDs in the state too
      setRequisitionIds(reqIds);
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

  // Updated to handle document toggle with documents array
  const handleDocumentToggle = (documentId: number) => {
    setData('documents',
      data.documents.includes(documentId)
        ? data.documents.filter(id => id !== documentId)
        : [...data.documents, documentId]
    );
  };

  // Handle selection of all documents
  const handleSelectAllDocuments = () => {
    const allDocumentIds = documents.map(doc => doc.id);
    setData('documents', allDocumentIds);
  };

  // Handle deselection of all documents
  const handleDeselectAllDocuments = () => {
    setData('documents', []);
  };

  // Modified to automatically select the new document
  const handleDocumentCreated = (newDocument: Document) => {
    setDocuments([...documents, newDocument]);
    // Automatically select the newly added document
    setData('documents', [...data.documents, newDocument.id]);
    setIsDocumentModalOpen(false);
  };

  // Modified to handle requisition selection from modal - ensure it adds to existing selection
  const handleRequisitionSelected = (selectedIds: number[]) => {
    // Filter out any IDs that are already in the requisitionIds array
    const newIds = selectedIds.filter(id => !requisitionIds.includes(id));

    // If there are new IDs, add them to the existing ones
    if (newIds.length > 0) {
      const updatedIds = [...requisitionIds, ...newIds];
      setRequisitionIds(updatedIds);
      setData('requisition_ids', updatedIds);
    } else {
      // Otherwise just set as is (might be removing items)
      setRequisitionIds(selectedIds);
      setData('requisition_ids', selectedIds);
    }
  };

  // Handle opening the requisition modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Handle closing the requisition modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Form submission handlers
  const handleSubmit = (e: React.FormEvent, status: 'draft') => {
    e.preventDefault();
    setData('status', status);

    const url = isEditing ? `/eois/${data.id}?_method=PUT` : '/eois';

    post(url, {
      onSuccess: () => {
        reset();
      },
    });
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
                    onSuccess={handleDocumentCreated} // Make sure this prop is passed correctly
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  {/* Document selection controls */}
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {data.documents.length} of {documents.length} selected
                    </span>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={handleSelectAllDocuments}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllDocuments}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Document list */}
                  <div className="h-32 overflow-y-auto">
                    {documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {documents.map((document) => (
                          <div
                            key={document.id}
                            className={`
                              p-3 rounded-md border transition-all duration-200
                              ${data.documents.includes(document.id)
                                ? 'bg-indigo-50 border-indigo-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'}
                            `}
                          >
                            <label className="flex items-start cursor-pointer">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  checked={data.documents.includes(document.id)}
                                  onChange={() => handleDocumentToggle(document.id)}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <span className={`font-medium ${data.documents.includes(document.id) ? 'text-indigo-700' : 'text-gray-700'}`}>
                                  {document.name}
                                </span>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-4">
                        <p className="text-gray-500 text-sm">No documents available. Add documents using the button above.</p>
                      </div>
                    )}
                  </div>
                  {errors.documents && (
                    <p className="mt-1 text-sm text-red-600">{errors.documents}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allow_partial_item_submission"
                      name="allow_partial_item_submission"
                      checked={data.allow_partial_item_submission}
                      onChange={handleCheckboxChange}
                      className="w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="allow_partial_item_submission" className="ml-2 block text-sm text-gray-900">
                      Allow Partial Item Submission
                    </label>
                  </div>
                  <div>
                    {/* Custom button to open modal */}
                    <button
                      type="button"
                      onClick={handleOpenModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add Requisitions
                    </button>

                    {/* Render the modal only when isModalOpen is true */}
                    {isModalOpen && (
                      <DirectRequisitionModal
                        onSuccess={handleRequisitionSelected}
                        onClose={handleCloseModal}
                        products={products}
                        initialSelectedIds={requisitionIds}
                        isOpen={isModalOpen}
                      />
                    )}

                  </div>
                </div>
                {errors.allow_partial_item_submission && (
                  <p className="mt-1 text-sm text-red-600">{errors.allow_partial_item_submission}</p>
                )}


              </div>

              {/* Display selected requisition IDs */}
              {requisitionIds.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Selected Requisition</label>
                  <div className="p-2 border rounded bg-white">
                    {requisitionIds.join(', ')}
                  </div>
                </div>
              )}

              {/* Hidden field to ensure requisition_ids is sent with the form */}
              <input
                type="hidden"
                name="requisition_ids"
                value={JSON.stringify(requisitionIds)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              {isEditing ? (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, data.status as 'draft')}
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
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    {processing ? 'Saving...' : 'Create EOI'}
                  </button>
                  {/* <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'submitted')}
                    disabled={processing}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {processing ? 'Submitting...' : 'Submit for Approval'}
                  </button> */}
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