import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
}

interface Props {
    roles: Role[];
    isEditing: boolean;
    user?: {
        id?: number;
        name: string;
        email: string;
        address: string;
        phone: number;
        selectedRoles: number[];
    };
}

const RoleForm: React.FC<Props> = ({ roles, isEditing, user }) => {
    // Set up breadcrumbs based on whether we're editing or creating
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'All Users',
            href: '/users',
        },
        {
            title: isEditing ? 'Edit User' : 'Create User',
            href: isEditing ? `/users/${user?.id}/edit` : '/users/create',
        },
    ];

    // Initialize form with either existing role data or empty values
    const { data, setData, errors, post, put, reset, processing } = useForm({
        id: user?.id || '',
        name: user?.name || '',
        email: user?.email || '',
        address: user?.address || '',
        phone: user?.phone || '',
        selectedRoles: user?.selectedRoles || [],
    });

    // Handle form submission
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/users/${user?.id}`, {
                onFinish: () => reset(),
            });
        } else {
            post('/register', {
                onFinish: () => reset(),
            });
        }
    };

    // Handle checkbox changes
    const handlePermissionToggle = (roleId: number) => {
        setData('selectedRoles',
            data.selectedRoles.includes(roleId)
                ? data.selectedRoles.filter(id => id !== roleId)
                : [...data.selectedRoles, roleId]
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Role' : 'Create Role'} />

            <div className="max-w-4xl mx-auto py-6">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">

                    <h2 className="text-xl">
                        {isEditing ? 'Edit Role' : 'Create New Role'}
                    </h2>

                    <form onSubmit={submit} className="px-6 py-4">
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Enter employee name"
                                className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="text"
                                id="email"
                                placeholder="Enter employee email"
                                className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>
                        <div className="mb-6">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <input
                                type="text"
                                id="address"
                                placeholder="Enter employee address"
                                className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                            />
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                            )}
                        </div>
                        <div className="mb-6">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="number"
                                id="phone"
                                placeholder="Enter employee phone"
                                className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Roles</label>
                                <span className="text-xs text-gray-500">
                                    {data.selectedRoles.length} of {roles.length} selected
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className={`
                        p-3 rounded-md border transition-all duration-200
                        ${data.selectedRoles.includes(role.id)
                                                    ? 'bg-indigo-50 border-indigo-300'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'}
                      `}
                                        >
                                            <label className="flex items-start cursor-pointer">
                                                <div className="flex items-center h-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.selectedRoles.includes(role.id)}
                                                        onChange={() => handlePermissionToggle(role.id)}
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <span className={`font-medium ${data.selectedRoles.includes(role.id) ? 'text-indigo-700' : 'text-gray-700'}`}>
                                                        {role.name}
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {errors.selectedRoles && (
                                <p className="mt-1 text-sm text-red-600">{errors.selectedRoles}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    <>{isEditing ? 'Update' : 'Create'} Role</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};

export default RoleForm;