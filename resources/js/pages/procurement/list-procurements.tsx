import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import DeleteModal from '@/components/delete-modal';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'All Procurements',
    href: '/dashboard',
  },

];

interface Procurement {
  id: number;
  title: string;
  description: string;
  required_date: string;
  // requester: string;
  status: string;
  urgency: string;
  eoi_id: number;
  request_items: {
    name: string;
    quantity: string;
    unit: string;
    estimated_unit_price: string;
    core_specifications: string;
    category:{
      category_name:string,
  }
  }
  requester: {
    name: string;
  }

}

interface IndexProps {
  procurements: {
    data: Procurement[];
    current_page: number;
    last_page: number;
  };
  flash: {
    message?: string;
    error?: string;
  };
}

export default function ListProcurement({ procurements, flash }: IndexProps) {
  console.log(procurements);

  return (
    // <h1>Category Page</h1>
    <AppLayout
      breadcrumbs={breadcrumbs}
    // header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Product Procurements</h2>}
    >
      <Head title="Procurements" />

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
            <div className="flex justify-end mb-6">
              <Link
                href={route('procurements.create')}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                Add New Procurement
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requister</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th> */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Item</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Item Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {procurements.data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No procurements found
                      </td>
                    </tr>
                  ) : (
                    procurements.data.map((procurement) => (
                      <tr key={procurement.id}>

                        {/* <td className="px-6 py-4 whitespace-nowrap">{procurement.requester}</td> */}
                        <td className="px-6 py-4 whitespace-nowrap">{procurement?.requester ? procurement.requester.name : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{procurement.title}</td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">{procurement.description}</td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {Array.isArray(procurement.request_items)
                            ? procurement.request_items.map((item) => item.name).join(', ')
                            : procurement.request_items.name}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {Array.isArray(procurement.request_items)
                            ? procurement.request_items.map((item) => item.category?.category_name || 'N/A').join(', ')
                            : procurement.request_items?.category?.category_name || 'N/A'}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">{procurement.required_date}</td>

                                              
                        {/* <td className="px-6 py-4 whitespace-nowrap">{procurement.description}</td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={route('procurements.edit', procurement.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </Link>

                          <DeleteModal
                            title="Delete Category"
                            description="Are you sure you want to delete this procurement? This action cannot be undone."
                            deleteRoute="procurements.destroy"
                            itemId={procurement.id}
                            onSuccess={() => console.log("Category deleted successfully!")}
                          />
                          <Link
                            href={route('procurements.show', procurement.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {procurements.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Link
                    href={procurements.current_page > 1 ? route('procurements.index', { page: procurements.current_page - 1 }) : '#'}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${procurements.current_page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Previous
                  </Link>
                  <Link
                    href={procurements.current_page < procurements.last_page ? route('procurements.index', { page: procurements.current_page + 1 }) : '#'}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${procurements.current_page === procurements.last_page ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Next
                  </Link>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      {Array.from({ length: procurements.last_page }, (_, i) => i + 1).map((page) => (
                        <Link
                          key={page}
                          href={route('procurements.index', { page })}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === procurements.current_page
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
