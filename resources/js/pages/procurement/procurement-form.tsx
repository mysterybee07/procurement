import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Bold, Italic, List, Link, Image, PlusCircle, Trash2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
}

interface RequestItem {
  id: number;
  product_id: number;
  required_quantity: string;
  additional_specifications: string;
}

interface RequisitionFormData {
  id: number;
  title: string;
  description: string;
  required_date: string;
  status: string;
  urgency: string;
  requestItems: RequestItem[];
  [key: string]: any;
}

// Define a more specific type for form errors
interface FormErrors {
  [key: string]: string;
}

interface Props {
  products: Product[];
  isEditing: boolean;
  requisition?: {
    id?: number;
    title?: string;
    description?: string;
    required_date?: string;
    urgency?: string;
    status?: string;
    request_items?: RequestItem[];
    
  }
}

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
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
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 min-h-24 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
};

const RequisitionForm: React.FC<Props> = ({ products, isEditing = false, requisition }) => {
  const defaultItem: RequestItem = {
    id: 0,
    required_quantity: '',
    additional_specifications: '',
    product_id: 0,
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Requisitions',
      href: '/requisitions',
    },
    {
      title: isEditing ? 'Edit Requisition' : 'Create Requisition',
      href: isEditing ? `/requisitions/${requisition?.id}/edit` : '/requisitions/create',
    },
  ];

  // Form initialization with type-safe errors
  const { data, setData, post, put, errors, processing, reset } = useForm<RequisitionFormData>({
    id: requisition?.id || 0,
    title: requisition?.title || '',
    description: requisition?.description || '',
    required_date: requisition?.required_date || '',
    status: requisition?.status || '',
    urgency: requisition?.urgency || 'Normal',
    requestItems: requisition?.request_items?.length
      ? requisition.request_items.map(item => ({
          id: item.id || 0,
          product_id: item.product_id || 0,
          required_quantity: item.required_quantity || '',
          additional_specifications: item.additional_specifications || '',
        }))
      : [{ ...defaultItem }],
  });

 

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionType, setSubmissionType] = useState<'draft' | 'submitted' | 'updated'>('draft');

  // Handle form submission
  // Handle form submission
  useEffect(() => {
    if (isSubmitting) {
      if (isEditing) {
        put(`/requisitions/${data.id}`, {
          onSuccess: () => {
            reset();
            setIsSubmitting(false);
          },
        });
      } else {
        post('/requisitions', {
          onSuccess: () => {
            reset();
            setIsSubmitting(false);
          },
        });
      }
    }
  }, [isSubmitting]);


  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedItems = [...data.requestItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'product_id' ? Number(value) : value
    };
    setData('requestItems', updatedItems);
  };

  const addNewItem = () => {
    setData('requestItems', [
      ...data.requestItems,
      { ...defaultItem },
    ]);
  };

  const removeItem = (index: number) => {
    if (data.requestItems.length > 1) {
      setData('requestItems', data.requestItems.filter((_, i) => i !== index));
    }
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

  const updateProcurement = (e: React.FormEvent) => {
    e.preventDefault();
    setData('status', 'draft');
    setSubmissionType('draft');
    setIsSubmitting(true);
  };

  // Helper function to safely get error messages
  const getErrorMessage = (field: string) => {
    return errors[field] || '';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Requisition' : 'Create New Requisition'}</h1>

          <form>
            {/* Requisition Details Section */}
            <div className="mb-8 p-6 border rounded-lg bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">Requisition Details</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Requisition Title*</label>
                <input
                  type="text"
                  name="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description*</label>
                <SimpleRichTextEditor
                  value={data.description}
                  onChange={(value) => setData('description', value)}
                  placeholder="Enter a detailed description of this Requisition..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Required Date*</label>
                  <input
                    type="date"
                    name="required_date"
                    value={data.required_date}
                    onChange={(e) => setData('required_date', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                  {errors.required_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.required_date}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Urgency</label>
                  <select
                    name="urgency"
                    value={data.urgency}
                    onChange={(e) => setData('urgency', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {errors.urgency && (
                    <p className="mt-1 text-sm text-red-600">{errors.urgency}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Request Items Section */}
            <div className="mb-8 p-6 border rounded-lg bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">Request Items</h2>

              {data.requestItems.map((item, index) => (
                <div key={index} className="mb-6 p-4 border rounded bg-white">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Item #{index + 1}</h3>
                    {data.requestItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 flex items-center text-sm"
                      >
                        <Trash2 size={16} className="mr-1" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Required Item*</label>
                    <select
                      name="product_id"
                      value={item.product_id}
                      onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value={0}>Select an item</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    {getErrorMessage(`requestItems.${index}.product_id`) && (
                      <p className="mt-1 text-sm text-red-600">
                        {getErrorMessage(`requestItems.${index}.product_id`)}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Additional Specifications</label>
                    <textarea
                      name="additional_specifications"
                      value={item.additional_specifications}
                      onChange={(e) => handleItemChange(index, 'additional_specifications', e.target.value)}
                      className="w-full p-2 border rounded h-20"
                    />
                    {getErrorMessage(`requestItems.${index}.additional_specifications`) && (
                      <p className="mt-1 text-sm text-red-600">
                        {getErrorMessage(`requestItems.${index}.additional_specifications`)}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Required Quantity*</label>
                      <input
                        type="number"
                        name="required_quantity"
                        value={item.required_quantity}
                        onChange={(e) => handleItemChange(index, 'required_quantity', e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                      />
                      {getErrorMessage(`requestItems.${index}.required_quantity`) && (
                        <p className="mt-1 text-sm text-red-600">
                          {getErrorMessage(`requestItems.${index}.required_quantity`)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addNewItem}
                className="flex items-center gap-2 text-blue-600 mb-4"
              >
                <PlusCircle size={16} /> Add New Item
              </button>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={updateProcurement}
                    disabled={processing}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {processing ? 'Updating...' : 'Update Procurement'}
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
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default RequisitionForm;