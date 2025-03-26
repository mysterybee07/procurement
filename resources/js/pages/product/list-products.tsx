import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import DeleteModal from '@/components/delete-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Categories',
        href: '/dashboard',
    },
];
interface Category {
    id: number;
    category_name: string;
}

interface Product {
    id: number;
    name: string;
    in_stock_quantity: number;
    unit: string;
    specifications: string;
    category: Category[];
}

interface IndexProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
    };
    flash: {
        message?: string;
        error?: string;
    };
}

export default function ListProduct({ products, flash }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Categories" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash.message && (
                        <div className="mb-4 text-green-600 bg-green-100 border border-green-400 px-4 py-2 rounded-md">
                            {flash.message}
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-4 text-red-600 bg-red-100 border border-red-400 px-4 py-2 rounded-md">
                            {flash.error}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-end mb-6">
                            <Link
                                href={route('products.create')}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold text-xs uppercase tracking-widest hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                            >
                                Add New Product
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specifications</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                                No products found
                                            </td>
                                        </tr>
                                    ) : (
                                        products.data.map((product) => (
                                            <tr key={product.id}>
                                                <td className="px-6 py-4">{product.name}</td>
                                                <td className="px-6 py-4">
                                                    {product.category.length > 0
                                                        ? product.category.map((cat) => cat.category_name).join(', ')
                                                        : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">{product.in_stock_quantity}</td>
                                                <td className="px-6 py-4">
                                                    {product.specifications?.length > 50
                                                        ? `${product.specifications.substring(0, 50)}...`
                                                        : product.specifications || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <Link
                                                        href={route('products.edit', product.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <DeleteModal
                                                        title="Delete Product"
                                                        description="Are you sure you want to delete this product? This action cannot be undone."
                                                        deleteRoute="products.destroy"
                                                        itemId={product.id}
                                                        onSuccess={() => console.log("Product deleted successfully!")}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <Link
                                        href={products.current_page > 1 ? route('products.index', { page: products.current_page - 1 }) : '#'}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${products.current_page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Previous
                                    </Link>
                                    <Link
                                        href={products.current_page < products.last_page ? route('products.index', { page: products.current_page + 1 }) : '#'}
                                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${products.current_page === products.last_page ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Next
                                    </Link>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        {Array.from({ length: products.last_page }, (_, i) => i + 1).map((page) => (
                                            <Link
                                                key={page}
                                                href={route('products.index', { page })}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                    page === products.current_page
                                                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline-indigo-600'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </Link>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
