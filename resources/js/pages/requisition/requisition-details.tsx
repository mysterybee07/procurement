import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import FulfillRequisitionModal from '@/components/fulfill-requisition-modal';
import { type BreadcrumbItem } from '@/types';
import ReceiveRequisitionModal from '@/components/receive-requisition-modal';

interface Product {
  id: number;
  name: string;
  unit: string;
  specifications: string;
  in_stock_quantity: number;
  category: {
    category_name: string;
  };
}

interface RequestItem {
  id: number;
  required_quantity: number;
  provided_quantity: number;
  status: string;
  product: Product;
}

interface Requisition {
  title: string;
  required_date: string;
  requester: {
    id: number;
    name: string;
  };
  urgency: string;
  request_items: RequestItem[];
}

interface RequisitionProps {
  requisition: Requisition;
  flash: {
    message?: string;
    error?: string;
  };
}

export default function RequisitionDetails({ requisition, flash }: RequisitionProps) {
  const { auth } = usePage().props as any;
  const user = auth?.user;


  // Breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Requisitions',
      href: route('requisitions.index')
    },
    {
      title: 'Requisition Details',
      href: '#'
    }
  ];

  // Helper function to format date
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Requisition Details" />

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

          <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
            {/* Header Section */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-center mb-6">{requisition.title}</h1>
              <div className='flex justify-between'>
                <div>
                  <span className="font-semibold">Requested By: </span>
                  <span>{requisition.requester.name}</span>
                </div>
                <div>
                  <span className="font-semibold">Required Date: </span>
                  <span>{formatDate(requisition.required_date)}</span>
                </div>
              </div>
            </header>

            {/* Introduction Section */}
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 mt-4">Required Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Item Name</th>
                      <th className="p-2 border">Required Quantity</th>
                      {user?.permissions?.includes('fulfill requisitionItem') && (
                        <th className="p-2 border">In Stock</th>
                      )}
                      <th className="p-2 border">Unit</th>
                      <th className="p-2 border">Specifications</th>
                      {(user?.id === requisition.requester.id ||
                        requisition.request_items.some(item => item.status !== "provided")) && (
                          <th className="p-2 border">Status</th>
                        )}
                      {user?.permissions?.includes('fulfill requisitionItem') &&
                        requisition.request_items.some(item => item.provided_quantity !== item.required_quantity) && (
                          <th className="p-2 border">Action</th>
                        )}
                    </tr>
                  </thead>
                  <tbody>
                    {requisition.request_items.map((requestItem) => (
                      requestItem.required_quantity > 0 && (
                        <tr key={requestItem.id} className="border-t">
                          <td className="p-2 border">{requestItem.product.name}</td>
                          <td className="p-2 border text-center">{requestItem.required_quantity - requestItem.provided_quantity}</td>
                          {user?.permissions?.includes('fulfill requisitionItem') && (
                            <td className="p-2 border text-center">{requestItem.product.in_stock_quantity}</td>
                          )}
                          <td className="p-2 border text-center">{requestItem.product.unit}</td>
                          <td className="p-2 border">{requestItem.product.specifications}</td>
                          {(user?.id === requisition.requester.id
                            || requestItem.provided_quantity === requestItem.required_quantity
                          ) && (
                              <td className="p-2 border">{requestItem.status}</td>
                            )}
                          {
                            (user?.permissions?.includes('fulfill requisitionItem') && requestItem.provided_quantity !== requestItem.required_quantity) ||
                              (user?.id === requisition.requester.id && requestItem.status === "provided") ? (
                              <td className="p-2 border">
                                {user?.permissions?.includes('fulfill requisitionItem') &&
                                  requestItem.provided_quantity !== requestItem.required_quantity ? (
                                  <FulfillRequisitionModal requestItemId={requestItem.id} />
                                ) : user?.id === requisition.requester.id && requestItem.status === "provided" ? (
                                  <ReceiveRequisitionModal requestItemId={requestItem.id} />
                                ) : null}
                              </td>
                            ) : null
                          }

                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Submission Deadline */}
            <div className="mb-6 p-4 bg-gray-100 rounded text-red-600">
              <span className="font-semibold">Urgency Level: </span>
              <span>{requisition.urgency}</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}