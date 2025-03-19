import React, { useEffect, useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    category_name: string;
}

interface Props {
    categories: Category[];
    isEditing: boolean;
    product?: {
        id?: number;
        name: string;
        in_stock_quantity: number;
        unit: string;
        specifications: string;
        category_id: string;
    };
}

// interface ProductFormData {
//     id?: number;
//     name: string;
//     in_stock: string;
//     unit: string;
//     specifications: string;
//     category_id: number;
//     [key: string]: any;
// }

const ProductForm: React.FC<Props> = ({ categories, isEditing = false, product }) => {
    // const defaultProduct: ProductFormData = {
    //     name: '',
    //     in_stock: '',
    //     unit: '',
    //     specifications: '',
    //     category_id: 0,
    // };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Products',
            href: '/products',
        },
        {
            title: isEditing ? 'Edit Product' : 'Create Product',
            href: isEditing ? `/products/${product?.id}/edit` : '/products/create',
        },
    ];

    // Form initialization
    const { data, setData, post, put, errors, processing, reset } = useForm({
        id: product?.id || 0,
        name: product?.name || '',
        in_stock_quantity: product?.in_stock_quantity || '',
        unit: product?.unit || '',
        specifications: product?.specifications || '',
        category_id: product?.category_id || 0,
    });
    console.log(errors);

    // Load product data when editing
    // useEffect(() => {
    //     if (isEditing && product) {
    //         setData({
    //             id: product.id,
    //             name: product.name || '',
    //             in_stock: product.in_stock || '',
    //             unit: product.unit || '',
    //             specifications: product.specifications || '',
    //             category_id: product.category_id || 0,
    //         });
    //     }
    // }, [isEditing, product]);

    // const [isSubmitting, setIsSubmitting] = useState(false);

    // useEffect(() => {
    //     if (isSubmitting) {
    //         if (isEditing) {
    //             post(`/products/${data.id}?_method=PUT`, {
    //                 onSuccess: () => {
    //                     reset();
    //                     setIsSubmitting(false);
    //                 },
    //             });
    //         } else {
    //             post('/products', {
    //                 onSuccess: () => {
    //                     reset();
    //                     setIsSubmitting(false);
    //                 },
    //             });
    //         }
    //     }
    // }, [isSubmitting]);

    // const handleChange = (
    //     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    // ) => {
    //     const { name, value } = e.target;
    //     setData(name as keyof ProductFormData, 
    //             name === 'category_id' ? Number(value) : value);
    // };

    // // Form submission handler
    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);
    // };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && product?.id) {
            put(`/products/${product.id}`, {
                onSuccess: () => {
                    // Optionally reset or redirect
                },
            });
        } else {
            // Create new category
            post('/products', {
                onSuccess: () => reset(),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-center">
                <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Product' : 'Create New Product'}</h1>

                    <form onSubmit={submit}>
                        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
                            <h2 className="text-xl font-semibold mb-4">Product Details</h2>

                            <div className="mb-6 p-4 border rounded bg-white">
                                <div className="flex gap-4 mb-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Product Name*</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Category*</label>
                                        <select
                                            name="category_id"
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
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
                                        {errors.category_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Specifications</label>
                                    <textarea
                                        name="specifications"
                                        value={data.specifications}
                                        onChange={(e) => setData('specifications', e.target.value)} className="w-full p-2 border rounded h-20"
                                    />
                                    {errors.specifications && (
                                        <p className="mt-1 text-sm text-red-600">{errors.specifications}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">In Stock*</label>
                                        <input
                                            type="number"
                                            name="in_stock_quantity"
                                            value={data.in_stock_quantity}
                                            onChange={(e) => setData('in_stock_quantity', parseInt(e.target.value) || 0)}                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                        {errors.in_stock_quantity && (
                                            <p className="mt-1 text-sm text-red-600">{errors.in_stock_quantity}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Unit*</label>
                                        <input
                                            type="text"
                                            name="unit"
                                            value={data.unit}
                                            onChange={(e) => setData('unit', e.target.value)}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                        {errors.unit && (
                                            <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
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
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};

export default ProductForm;