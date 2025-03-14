import { useForm, Head } from '@inertiajs/react';
import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface ParentCategory {
    id: number;
    category_name: string;
}

interface Props {
    parentCategories: ParentCategory[];
    isEditing?: boolean;
    category?: {
        id?: number;
        category_name: string;
        category_code: string;
        description: string;
        parent_category_id: string | number | null;
    };
}

const ProductCategoryForm: React.FC<Props> = ({ parentCategories, isEditing = false, category }) => {
    // Set up breadcrumbs based on whether we're editing or creating
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'All Categories',
            href: '/categories',
        },
        {
            title: isEditing ? 'Edit Category' : 'Create Category',
            href: '/categories/create',
        },
        
    ];

    // Initialize form with either existing category data or empty values
    const { data, setData, errors, post, put, reset, processing } = useForm({
        id: category?.id || '',
        category_name: category?.category_name || '',
        category_code: category?.category_code || '',
        description: category?.description || '',
        parent_category_id: category?.parent_category_id?.toString() || '',
    });

    // Handle form submission
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing && category?.id) {
            // Update existing category
            put(`/categories/${category.id}`, {
                onSuccess: () => {
                    // Optionally reset or redirect
                },
            });
        } else {
            // Create new category
            post('/categories', {
                onSuccess: () => reset(),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? "Edit Product Category" : "Create Product Category"} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-6">
                            {isEditing ? 'Edit Category' : 'Create New Category'}
                        </h1>
                        
                        <form onSubmit={submit}>
                            {/* Category Name */}
                            <div className="mb-4">
                                <label htmlFor="category_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    id="category_name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={data.category_name}
                                    onChange={(e) => setData('category_name', e.target.value)}
                                />
                                {errors.category_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category_name}</p>
                                )}
                            </div>

                            {/* Category Code */}
                            <div className="mb-4">
                                <label htmlFor="category_code" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Code
                                </label>
                                <input
                                    type="text"
                                    id="category_code"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={data.category_code}
                                    onChange={(e) => setData('category_code', e.target.value)}
                                />
                                {errors.category_code && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category_code}</p>
                                )}
                            </div>

                            {/* Description with Rich Editor */}
                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <div className="border border-gray-300 rounded-md overflow-hidden">
                                    {/* Editor Toolbar */}
                                    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
                                        <button
                                            type="button"
                                            className="p-1 rounded hover:bg-gray-200"
                                            onClick={() => document.execCommand('bold')}
                                        >
                                            <span className="font-bold">B</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="p-1 rounded hover:bg-gray-200"
                                            onClick={() => document.execCommand('italic')}
                                        >
                                            <span className="italic">I</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="p-1 rounded hover:bg-gray-200"
                                            onClick={() => document.execCommand('underline')}
                                        >
                                            <span className="underline">U</span>
                                        </button>
                                        <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                        <button
                                            type="button"
                                            className="p-1 rounded hover:bg-gray-200"
                                            onClick={() => document.execCommand('insertUnorderedList')}
                                        >
                                            <span>• List</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="p-1 rounded hover:bg-gray-200"
                                            onClick={() => document.execCommand('insertOrderedList')}
                                        >
                                            <span>1. List</span>
                                        </button>
                                        <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                        <button
                                            type="button"
                                            className="p-1 rounded hover:bg-gray-200"
                                            onClick={() => document.execCommand('justifyLeft')}
                                        >
                                            Left
                                        </button>
                                        <button
                                            type="button"
                                            className="p-1 rounded hover:bg-gray-200"
                                            onClick={() => document.execCommand('justifyCenter')}
                                        >
                                            Center
                                        </button>
                                        <button
                                            type="button"
                                            className="p-1 rounded hover:bg-gray-200"
                                            onClick={() => document.execCommand('justifyRight')}
                                        >
                                            Right
                                        </button>
                                    </div>

                                    {/* Content Editable Area */}
                                    <div
                                        contentEditable
                                        className="w-full p-3 min-h-32 focus:outline-none"
                                        onBlur={(e) => setData('description', e.target.innerHTML)}
                                        dangerouslySetInnerHTML={{ __html: data.description }}
                                    ></div>
                                </div>
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Parent Category */}
                            <div className="mb-6">
                                <label htmlFor="parent_category_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Parent Category
                                </label>
                                <select
                                    id="parent_category_id"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={data.parent_category_id}
                                    onChange={(e) => setData('parent_category_id', e.target.value)}
                                >
                                    <option value="">None (Top Level Category)</option>
                                    {parentCategories.map((parentCategory) => (
                                        <option 
                                            key={parentCategory.id} 
                                            value={parentCategory.id.toString()}
                                            disabled={isEditing && category?.id === parentCategory.id}
                                        >
                                            {parentCategory.category_name}
                                        </option>
                                    ))}
                                </select>

                                {errors.parent_category_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.parent_category_id}</p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    onClick={() => window.history.back()}
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : isEditing ? 'Update Category' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ProductCategoryForm;