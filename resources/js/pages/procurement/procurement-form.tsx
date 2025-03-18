import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Bold, Italic, List, Link, Image, PlusCircle, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  category_name: string;
}
// const requestItems= request_items;
interface RequestItem {
  name: string;
  quantity: string;
  unit: string;
  estimated_unit_price: string;
  core_specifications: string;
  category_id: number;
}

interface Props {
  categories: Category[];
  isEditing: boolean;
  procurement?: {
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
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

interface ProcurementFormData {
  id: number;
  title: string;
  description: string;
  required_date: string;
  requester: string;
  status: string;
  urgency: string;
  eoi_id: number;
  requestItems: RequestItem[];
  [key: string]: any;
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

const ProcurementForm: React.FC<Props> = ({ categories, isEditing, procurement }) => {
  const defaultItem: RequestItem = {
    name: '',
    quantity: '',
    unit: '',
    estimated_unit_price: '',
    core_specifications: '',
    category_id: 0,
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Procurements',
      href: '/procurements',
    },
    {
      title: isEditing ? 'Edit Procurement' : 'Create Procurement',
      href: isEditing ? `/procurement/${procurement?.id}/edit` : '/procurements/create',
    },
  ];

  // Form initialization
  const { data, setData, post, errors, processing, reset } = useForm<ProcurementFormData>({
   
    id: 0,
    title: '',
    description: '',
    required_date: '',
    requester: '',
    status: '',
    urgency: 'Normal',
    eoi_id: 0,
    requestItems: [{ ...defaultItem }],
  });
  console.log(errors);

  // Load procurement data when editing
  useEffect(() => {
    if (isEditing && procurement) {
      // console.log('Procurement data:', procurement);
      // console.log('Request items:', procurement.request_items);
    
      setData({
        id: procurement.id || 0,
        title: procurement.title || '',
        description: procurement.description || '',
        required_date: procurement.required_date || '',
        requester: data.requester || '',
        status: procurement.status || '',
        urgency: procurement.urgency || 'Normal',
        eoi_id: data.eoi_id || 0,
        requestItems: procurement.request_items?.length
          ? procurement.request_items.map(item => ({
              name: item.name || '',
              quantity: item.quantity || '',
              unit: item.unit || '',
              estimated_unit_price: item.estimated_unit_price || '',
              core_specifications: item.core_specifications || '',
              category_id: item.category_id || 0,
            }))
          : [{ ...defaultItem }],
      });
    }
  }, [isEditing, procurement]);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionType, setSubmissionType] = useState<'draft' | 'submitted' | 'updated'>('draft');

  // Handle form submission
  useEffect(() => {
    if (isSubmitting) {
      if (isEditing) {
        post(`/procurements/${data.id}?_method=PUT`, {
          onSuccess: () => {
            reset();
            setIsSubmitting(false);
          },
        });
      } else {
        post('/procurements', {
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
    setData(name as keyof ProcurementFormData, value);
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedItems = [...data.requestItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: name === 'category_id' ? Number(value) : value
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Procurement' : 'Create New Procurement'}</h1>

          <form>
            {/* Procurement Details Section */}
            <div className="mb-8 p-6 border rounded-lg bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">Procurement Details</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Procurement Title*</label>
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
                <label className="block text-sm font-medium mb-1">Description*</label>
                <SimpleRichTextEditor
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Enter a detailed description of this Procurement..."
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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

                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Item Name*</label>
                      <input
                        type="text"
                        name="name"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-2 border rounded"
                        required
                      />
                      {errors[`requestItems.${index}.name`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`requestItems.${index}.name`]}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Category*</label>
                      <select
                        name="category_id"
                        value={item.category_id}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value={0}>Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.category_name}
                          </option>
                        ))}
                      </select>
                      {errors[`requestItems.${index}.category_id`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`requestItems.${index}.category_id`]}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Core Specifications</label>
                    <textarea
                      name="core_specifications"
                      value={item.core_specifications}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 border rounded h-20"
                    />
                    {errors[`requestItems.${index}.core_specifications`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`requestItems.${index}.core_specifications`]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Quantity*</label>
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-2 border rounded"
                        required
                      />
                      {errors[`requestItems.${index}.quantity`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`requestItems.${index}.quantity`]}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Unit*</label>
                      <input
                        type="text"
                        name="unit"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-2 border rounded"
                        required
                      />
                      {errors[`requestItems.${index}.unit`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`requestItems.${index}.unit`]}</p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Estimated Unit Price*</label>
                      <input
                        type="number"
                        name="estimated_unit_price"
                        value={item.estimated_unit_price}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-2 border rounded"
                        required
                      />
                      {errors[`requestItems.${index}.estimated_unit_price`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`requestItems.${index}.estimated_unit_price`]}</p>
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

export default ProcurementForm;