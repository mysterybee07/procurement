import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
  id: number;
  category_name: string;
  category_code: string;
  parent_category_id: number | null;
  description: string;
}

interface CategoryFormProps {
  editingCategory?: Category | null;
  onSaveSuccess?: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ editingCategory, onSaveSuccess }) => {
  // State definitions
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryCode, setCategoryCode] = useState<string>('');
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [parentCategories, setParentCategories] = useState<Category[]>([]);

  // Set form data when editing category changes
  useEffect(() => {
    if (editingCategory) {
      setCategoryName(editingCategory.category_name);
      setCategoryCode(editingCategory.category_code);
      setParentCategoryId(editingCategory.parent_category_id?.toString() || '');
      setDescription(editingCategory.description);
      setIsEditing(true);
      setEditingCategoryId(editingCategory.id);
    } else {
      resetForm();
    }
  }, [editingCategory]);

  // Fetch parent categories for dropdown
  useEffect(() => {
    fetchParentCategories();
  }, []);

  const fetchParentCategories = async () => {
    try {
      const response = await axios.get('/api/parent-categories');
      setParentCategories(response.data);
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  // Form handling
  const resetForm = () => {
    setCategoryName('');
    setCategoryCode('');
    setParentCategoryId('');
    setDescription('');
    setIsEditing(false);
    setEditingCategoryId(null);
    setErrors({});
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const categoryData = {
      category_name: categoryName,
      category_code: categoryCode,
      parent_category_id: parentCategoryId || null,
      description
    };

    try {
      if (isEditing && editingCategoryId) {
        await axios.put(`/api/categories/${editingCategoryId}`, categoryData);
        setMessage('Category updated successfully');
      } else {
        await axios.post('/api/categories', categoryData);
        setMessage('Category added successfully');
      }
      
      resetForm();
      
      // Call the success callback if provided
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      // Auto-hide the message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error('Error saving category:', error);
      }
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 leading-tight mb-6">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h2>
          
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              {message}
            </div>
          )}
          
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category_name" className="block text-sm font-medium text-gray-700">Category Name</label>
                <input
                  id="category_name"
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.category_name ? 'border-red-500' : ''}`}
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
                {errors.category_name && <span className="text-red-500 text-sm">{errors.category_name}</span>}
              </div>
              
              <div>
                <label htmlFor="category_code" className="block text-sm font-medium text-gray-700">Category Code</label>
                <input
                  id="category_code"
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.category_code ? 'border-red-500' : ''}`}
                  type="text"
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value)}
                />
                {errors.category_code && <span className="text-red-500 text-sm">{errors.category_code}</span>}
              </div>
              
              <div>
                <label htmlFor="parent_category_id" className="block text-sm font-medium text-gray-700">Parent Category (Optional)</label>
                <select
                  id="parent_category_id"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={parentCategoryId}
                  onChange={(e) => setParentCategoryId(e.target.value)}
                >
                  <option value="">-- Select Parent Category --</option>
                  {parentCategories.map((parentCategory) => (
                    <option key={parentCategory.id} value={parentCategory.id}>
                      {parentCategory.category_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isEditing ? 'Update Category' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;