import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import DataTable from "@/components/datatable";

const breadcrumbs = [
    { title: "All Products", href: "/dashboard" },
];

const columns = [
    {
        data: "name",
        title: "Name",
        className: "text-center"
    },
    { 
        data: "categories",
        title: "Category", 
        className: "text-center" 
    },
    { 
        data: "in_stock_quantity", 
        title: "In Stock", 
        className: "text-center" 
    },
    { 
        data: "unit", 
        title: "Unit", 
        className: "text-center" 
    },
    { 
        data: "specifications", 
        title: "Specifications", 
        className: "text-center" },
    {
        data: "actions",
        title: "Actions",
        className: "text-center",
        orderable: false,
        searchable: false
    },
];
interface IndexProps {
    flash: {
        message?: string;
        error?: string;
    };
}

export default function ListProduct({ flash }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="container mx-auto p-4">
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
                <h2 className="text-xl font-bold mb-4">All Products</h2>
                <div className="flex justify-end mb-6">
                    <Link
                        href={route('products.create')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Add New Product
                    </Link>
                </div>
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <DataTable columns={columns} ajaxUrl="/products" />
                </div>
            </div>
        </AppLayout>
    );
};

// export default ListProduct;