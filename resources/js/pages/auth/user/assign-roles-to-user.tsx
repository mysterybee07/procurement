import React, { useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Role {
  id: number;
  name: string;
}

interface Props {
  roles: Role[];
  userId: number; 
  selectedRoles: number[]; 
}

const AssignRole: React.FC<Props> = ({ roles, userId, selectedRoles }) => {
 
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'All Users',
      href: '/users',
    },
    {
      title: 'Assign Roles',
      href: `/users/${userId}/roles`, 
    },
  ];

  // Initialize form with the selected roles
  const { data, setData, errors, put, reset, processing } = useForm({
    selectedRoles: selectedRoles || [],
  });

  // Handle form submission
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    put(`/users/${userId}/roles`, {
      onFinish: () => reset(),
    });
  };

  // Handle checkbox changes
  const handleRoleToggle = (roleId: number) => {
    setData('selectedRoles', 
      data.selectedRoles.includes(roleId)
        ? data.selectedRoles.filter(id => id !== roleId)
        : [...data.selectedRoles, roleId]
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Assign Roles" />
      
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          
            <h2 className="text-xl font-semibold px-6 py-4">
                Assign Roles
            </h2>
          
          <form onSubmit={submit} className="px-6 py-4">

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
                            onChange={() => handleRoleToggle(role.id)}
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
                  <>Assign Role</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default AssignRole;
