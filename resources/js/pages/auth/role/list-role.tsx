import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import DeleteModal from '@/components/delete-modal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'All Roles', href: '/dashboard' },
];

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface PageProps {
    roles: {
        data: Role[];
        current_page: number;
        last_page: number;
    };
    flash: {
        message?: string;
        error?: string;
    };
}

export default function ListRole({ roles, flash }: PageProps) {
    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        // header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Product Categories</h2>}
        >
            <Head title="Roles" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Message */}
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
                                href={route('roles.create')}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Add New Role
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th> */}
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {roles.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                                No roles found
                                            </td>
                                        </tr>
                                    ) : (
                                        roles.data.map((role) => (
                                            <tr key={role.id}>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>

                                                {/* <td className="table-cell">{role.permissions.map(p => p.name).join(', ') || 'No Permissions'}</td> */}

                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {role.name !== "superadmin" && (
                                                        <>
                                                            <Link
                                                                href={route("roles.edit", role.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <DeleteModal
                                                                title="Delete Role"
                                                                description="Are you sure you want to delete this role? This action cannot be undone."
                                                                deleteRoute="roles.destroy"
                                                                itemId={role.id}
                                                                onSuccess={() => console.log("Role deleted successfully!")}
                                                            />
                                                        </>
                                                    )}
                                                    <Link
                                                        href={route("roles.permissions", role.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3 pl-4"
                                                    >
                                                        Assign/Remove Permissions
                                                    </Link>
                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {roles.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <Link
                                        href={roles.current_page > 1 ? route('roles.index', { page: roles.current_page - 1 }) : '#'}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${roles.current_page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Previous
                                    </Link>
                                    <Link
                                        href={roles.current_page < roles.last_page ? route('roles.index', { page: roles.current_page + 1 }) : '#'}
                                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${roles.current_page === roles.last_page ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Next
                                    </Link>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            {Array.from({ length: roles.last_page }, (_, i) => i + 1).map((page) => (
                                                <Link
                                                    key={page}
                                                    href={route('roles.index', { page })}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === roles.current_page
                                                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                                        }`}
                                                >
                                                    {page}
                                                </Link>
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
