import React, { useState } from 'react';
import { PlusCircle, Trash2, Save, Send, Bold, Italic, List, Link, Image } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';


const breadcrumbs: BreadcrumbItem[] = [
  { title: 'All Users', href: '/dashboard' },
];

interface Category {
  id: number;
  name: string;
}

interface ProcurementData {
  title: string;
  description: string;
  required_date: string;
  requester: string;
  status: string;
  urgency: string;
  eoi_id: number;
}

interface RequestItem {
  name: string;
  quantity: string;
  unit: string;
  estimated_unit_price: string;
  core_specifications: string;
  category_id: number;
}

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
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

// Complete ProcurementForm Component
const ProcurementForm: React.FC = () => {
  const [procurementData, setProcurementData] = useState<ProcurementData>({
    title: '',
    description: '',
    required_date: '',
    requester: '',
    status: 'Draft',
    urgency: 'Normal',
    eoi_id: 0,
  });

  const [requestItems, setRequestItems] = useState<RequestItem[]>([
    {
      name: '',
      quantity: '',
      unit: '',
      estimated_unit_price: '',
      core_specifications: '',
      category_id: 0,
    },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Hardware' },
    { id: 2, name: 'Software' },
    { id: 3, name: 'Consulting Services' },
    { id: 4, name: 'Office Supplies' },
  ]);

  const handleProcurementChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProcurementData({
      ...procurementData,
      [name]: value,
    });
  };


  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedItems = [...requestItems];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setRequestItems(updatedItems);
  };

  const addNewItem = () => {
    setRequestItems([
      ...requestItems,
      {
        name: '',
        quantity: '',
        unit: '',
        estimated_unit_price: '',
        core_specifications: '',
        category_id: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    const updatedItems = requestItems.filter((_, i) => i !== index);
    setRequestItems(updatedItems);
  };

  const saveAsDraft = () => {
    console.log('Saving EOI as draft:', { procurementData, requestItems });
    // apicall
  };

  const submitForApproval = () => {
    console.log('Submitting EOI for approval:', { procurementData, requestItems });
    // apicall
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Create New Requests</h1>


          <div className="mb-8 p-6 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Procurement Details</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Procurement Title*</label>
              <input
                type="text"
                name="title"
                value={procurementData.title}
                onChange={handleProcurementChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>


            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description*</label>
              <SimpleRichTextEditor
                value={procurementData.description}
                onChange={(e) => setProcurementData({ ...procurementData, description: e.target.value })}
                placeholder="Enter a detailed description of this Procurement..."
              />
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Required Date*</label>
                <input
                  type="date"
                  name="required_date"
                  value={procurementData.required_date}
                  onChange={handleProcurementChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Urgency</label>
                <select
                  name="urgency"
                  value={procurementData.urgency}
                  onChange={handleProcurementChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </div>


          <div className="mb-8 p-6 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Request Items</h2>
            {requestItems.map((item, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Item #{index + 1}</h3>
                  {requestItems.length > 1 && (
                    <button
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
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description*</label>
                  <SimpleRichTextEditor
                    value={item.description}
                    onChange={(e) => setRequestItems(requestItems.map((i, idx) => (idx === index ? { ...i, description: e.target.value } : i)))}
                    placeholder="Enter a detailed description for the item..."
                  />
                </div> */}

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Core Specifications</label>
                  <textarea
                    name="core_specifications"
                    value={item.core_specifications}
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full p-2 border rounded h-20"
                  />
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex gap-4">
              <button
                type="button"
                onClick={saveAsDraft}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={submitForApproval}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProcurementForm;
