import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import DataTable from "@/components/datatable";

const breadcrumbs = [
    { title: "All Categories", href: "/dashboard" },
];

const columns = [
    { 
        data: "category_code", 
        title: "Code", 
        className: "text-center" 
    },
    { 
        data: "category_name", 
        title: "Name", 
        className: "text-center" 
    },
    { 
        data: "parent_category_name", 
        title: "Parent Category", 
        className: "text-center" 
    },
    { 
        data: "description", 
        title: "Description", 
        className: "text-center" 
    },
    {
        data: "actions",
        title: "Actions",
        className: "text-center",
        orderable: false,
        searchable: false
    },
];

const ListProduct: React.FC = () => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Categories" />
            <div className="container mx-auto p-4">
                <h2 className="text-xl font-bold mb-4">Product Categories</h2>
                <div className="flex justify-end mb-6">
                    <Link
                        href={route('categories.create')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Add New Category
                    </Link>
                </div>
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <DataTable columns={columns} ajaxUrl="/categories" />
                </div>
            </div>
        </AppLayout>
    );
};

export default ListProduct;
