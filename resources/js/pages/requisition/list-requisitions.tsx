import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import DeleteModal from '@/components/delete-modal';
import { Button } from '@headlessui/react';
import Confirmation from '@/components/confirmation-modal';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'All Requisitions',
    href: '/dashboard',
  },
];

interface Requisition {
  id: number;
  title: string;
  description: string;
  required_date: string;
  status: string;
  urgency: string;
  eoi_id: number;
  request_items: Array<{
    required_quantity: string;
    additional_specifications: string;
    product: {
      name: string;
      in_stock_quantity: number;
    };
  }>;
  requester: {
    name: string;
  };
}


interface IndexProps {
  requisitions: {
    data: Requisition[];
    current_page: number;
    last_page: number;
  };
  flash: {
    message?: string;
    error?: string;
  };
}


export default function ListRequisition({ requisitions, flash }: IndexProps) {
  const [selectedRequisitions, setSelectedRequisitions] = useState<number[]>([]);
  console.log(requisitions.data);

  const toggleRequisitionselection = (id: number) => {
    if (selectedRequisitions.includes(id)) {
      setSelectedRequisitions(selectedRequisitions.filter(requisitionId => requisitionId !== id));
    } else {
      setSelectedRequisitions([...selectedRequisitions, id]);
    }
  };

  const createEOI = () => {
    router.visit(route('eois.create', { requisition_ids: selectedRequisitions }));
  };

  // const onEdit = () => {
  //   router.visit(route('eois.edit', { requisition_ids: selectedRequisitions }));
  // };

  const showMessage = () => {
    confirm("Please select Requisitions First");
    // <Confirmation
    //   title="Select Requisition"
    //   description="Please select one of "
    //   buttonLabel="OK"
    //   buttonVariant="secondary"
    //   onConfirm={() => console.log("Item deleted!")}
    // />
  }
  console.log(requisitions.data)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Requisitions" />

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
            <div className="flex justify-between mb-6">
              <div>
                <button
                  onClick={selectedRequisitions.length === 0 ? showMessage : createEOI}
                  className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                  Create EOI (selected({selectedRequisitions.length}))
                </button>

              </div>
              <div>
                <Link
                  href={route('requisitions.create')}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                  Add New Requisition
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <span>Select</span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requister</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Item</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Stock</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requisitions.data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No requisitions found
                      </td>
                    </tr>
                  ) : (
                    requisitions.data.map((requisition) => (
                      <tr key={requisition.id}>
                        {/* Checkbox */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            checked={selectedRequisitions.includes(requisition.id)}
                            onChange={() => toggleRequisitionselection(requisition.id)}
                            disabled={!!requisition.eoi_id} // Disable if linked to an EOI
                          />
                        </td>

                        {/* Requester Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {requisition?.requester ? requisition.requester.name : 'N/A'}
                        </td>

                        {/* Title */}
                        <td className="px-6 py-4 whitespace-nowrap">{requisition.title}</td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">{requisition.request_items.required_quantity}</td> */}

                        {/* Requested Products */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {requisition.request_items.length > 0
                            ? requisition.request_items
                              .map((item) =>                               
                                item.product.name                                  
                              )
                              .join(', ')
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {Array.isArray(requisition.request_items) && requisition.request_items.length > 0
                            ? requisition.request_items.map((item) => item.required_quantity).join(', ')
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {requisition.request_items.length > 0
                            ? requisition.request_items
                              .map((item) =>
                        
                                  item.product.in_stock_quantity
                              )
                              .join(', ')
                            : 'N/A'}
                        </td>

                        {/* Required Date */}
                        <td className="px-6 py-4 whitespace-nowrap">{requisition.required_date}</td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${requisition.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                requisition.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  requisition.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'}`}
                          >
                            {requisition.status || 'N/A'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <Button
                            onClick={() => router.visit(route('requisitions.show', requisition.id))}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </Button>

                          <Button
                            onClick={() => router.visit(route('requisitions.edit', requisition.id))}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Button>

                          <DeleteModal
                            title="Delete Requisition"
                            description="Are you sure you want to delete this requisition? This action cannot be undone."
                            deleteRoute="requisitions.destroy"
                            itemId={requisition.id}
                            onSuccess={() => console.log("Requisition deleted successfully!")}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>

            {/* Pagination */}
            {requisitions.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Link
                    href={requisitions.current_page > 1 ? route('requisitions.index', { page: requisitions.current_page - 1 }) : '#'}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${requisitions.current_page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Previous
                  </Link>
                  <Link
                    href={requisitions.current_page < requisitions.last_page ? route('requisitions.index', { page: requisitions.current_page + 1 }) : '#'}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${requisitions.current_page === requisitions.last_page ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Next
                  </Link>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      {Array.from({ length: requisitions.last_page }, (_, i) => i + 1).map((page) => (
                        <Link
                          key={page}
                          href={route('requisitions.index', { page })}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === requisitions.current_page
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