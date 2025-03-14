import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';


interface Props {
  isEditing: boolean;
  permission?: {
    id?: number;
    name: string;
  };
}

const PermissionForm: React.FC<Props> = ({isEditing, permission }) => {
  // Set up breadcrumbs based on whether we're editing or creating
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'All Permissions',
      href: '/permissions',
    },
    {
      title: isEditing ? 'Edit Permission' : 'Create Permission',
      href: isEditing ? `/permissions/${permission?.id}/edit` : '/permissions/create',
    },
  ];

  // Initialize form with either existing permission data or empty values
  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: permission?.id || '',
    name: permission?.name || '',
  });

  // Handle form submission
  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      put(`/permissions/${permission?.id}`, {
        onFinish: () => reset(),
      });
    } else {
      post('/permissions', {
        onFinish: () => reset(),
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEditing ? 'Edit Permission' : 'Create Permission'}  />
      
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          
            <h2 className="text-xl">
              {isEditing ? 'Edit Permission' : 'Create New Permission'}
            </h2>
          
          <form onSubmit={submit} className="px-6 py-4">
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Permission Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter permission name"
                className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
                  <>{isEditing ? 'Update' : 'Create'} Permission</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default PermissionForm;