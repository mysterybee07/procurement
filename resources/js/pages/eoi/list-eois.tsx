import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import DeleteModal from '@/components/delete-modal';
import { Button } from '@headlessui/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'All Requisitions',
    href: '/dashboard',
  },
];

interface Eoi {
  id: number;
  eoi_number: number;
  title: string;
  created_at: string;
  submission_deadline: string;
  status: string;
  requisitions: Array<{
    requester: {
      name: string;
    }
  }>;
  created_by: {
    name: string;
  };
}

interface EoiProps {
  eois: {
    data: Eoi[];
    current_page: number;
    last_page: number;
  };
  flash: {
    message?: string;
    error?: string;
  };
}


export default function ListEOI({ eois, flash }: EoiProps) {
  // console.log(eois);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="EOIs" />

      <div className="py-12">
        <div className="w-full mx-auto sm:px-6 lg:px-8">
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
            <div className='flex justify-end '>
              <Link
                href={route('eois.create')}
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                Create New EOI
              </Link>
            </div>
            <div className="overflow-x-auto mt-4">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EOI No.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Items</th> */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eois.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No EOIs found
                      </td>
                    </tr>
                  ) : (
                    eois.data.map((eoi) => (
                      <tr key={eoi.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{eoi.eoi_number || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{eoi.title}</td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {eoi.created_by ? eoi.created_by.name : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(eoi.created_at).toLocaleDateString('en-CA')}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${eoi.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                eoi.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  eoi.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'}`}
                          >
                            {eoi.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <Button
                            onClick={() => router.visit(route('eois.show', eoi.id))}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </Button>

                          <Button
                            onClick={() => router.visit(route('eois.edit', eoi.id))}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Button>

                          <DeleteModal
                            title="Delete EOI"
                            description="Are you sure you want to delete this EOI? This action cannot be undone."
                            deleteRoute="eois.destroy"
                            itemId={eoi.id}
                            onSuccess={() => { }}
                          />

                          <Button
                            onClick={() => router.visit(route('eoisubmission.list', eoi.id))}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Submissions
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {eois.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Link
                    href={eois.current_page > 1 ? route('eois.index', { page: eois.current_page - 1 }) : '#'}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${eois.current_page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Previous
                  </Link>
                  <Link
                    href={eois.current_page < eois.last_page ? route('eois.index', { page: eois.current_page + 1 }) : '#'}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${eois.current_page === eois.last_page ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Next
                  </Link>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      {Array.from({ length: eois.last_page }, (_, i) => i + 1).map((page) => (
                        <Link
                          key={page}
                          href={route('eois.index', { page })}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === eois.current_page
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