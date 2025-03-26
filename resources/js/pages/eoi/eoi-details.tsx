import React from 'react';
import { Head, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import PublishEOIModal from '@/components/publish-eoi-modal';

// Interfaces
interface Product {
  id: number;
  name: string;
  unit: string;
  specifications: string;
  category: {
    category_name: string;
  };
}

interface RequestItem {
  required_quantity: number;
  product: Product;
}

interface Requisition {
  request_items: RequestItem[];
}

interface Document {
  id: number;
  name: string;
}

interface User {
  name: string;
}

interface Eoi {
  id: number;
  eoi_number: number;
  title: string;
  description: string;
  evaluation_criteria: string;
  created_at: string;
  publish_date: string;
  submission_deadline: string;
  status: string;
  requisitions: Requisition[];
  created_by: User;
  documents: Document[];
}

// interface PageProps {
//   auth: {
//     user?: User;
//   };
//   flash: {
//     message: string;
//     error: string;
//   };
// }

interface EOIProps {
  eoi: Eoi;
  flash: {
    message: string;
    error: string;
  };
  organizationName: string;
  organizationAddress: string;
}

export default function EOIDetails({ eoi, organizationName, organizationAddress, flash }: EOIProps) {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Collect all unique request items across all requisitions
  const getAggregatedRequestItems = () => {
    const itemMap = new Map<number, RequestItem>();

    eoi.requisitions.forEach((requisition) => {
      requisition.request_items.forEach((item) => {
        const productKey = item.product.id;

        if (itemMap.has(productKey)) {
          const existingItem = itemMap.get(productKey)!;
          existingItem.required_quantity += item.required_quantity;
        } else {
          itemMap.set(productKey, { ...item });
        }
      });
    });

    return Array.from(itemMap.values());
  };

  // Get aggregated items
  const aggregatedItems = getAggregatedRequestItems();

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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`EOI - ${eoi.title}`} />

      <div className="py-12">
        <div className="w-full mx-auto sm:px-6 lg:px-8">
          {/* Flash Messages */}
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
              <h1 className="text-3xl font-bold text-center mb-6">{eoi.title}</h1>

              <div className="flex justify-between mb-4">
                <div>
                  <span className="font-semibold">EOI Number: </span>
                  <span>{eoi.eoi_number}</span>
                </div>
                {eoi.status === "published" ? (
                  <div>
                    <span className="font-semibold">Publish Date: </span>
                    <span>{formatDate(eoi.publish_date)}</span>
                  </div>

                ) : (
                  <div>
                    <span className="font-semibold">Created at: </span>
                    <span>{formatDate(eoi.created_at)}</span>
                  </div>
                )}
              </div>
              <div className="text-center mb-2">
                <span className="font-semibold text-2xl">Whetstone Associates</span>
              </div>

              <div className="text-center mb-4">
                <span className="font-semibold">Sankhamul, Kathmandu</span>
              </div>
            </header>

            {/* Introduction Section */}
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="mb-2">
                {organizationName} invites qualified suppliers to submit an Expression of Interest (EOI)
                for {eoi.title}. This EOI aims to identify potential suppliers who may participate in the
                detailed Request for Proposal (RFP) process.
              </p>

              <h2 className="text-xl font-semibold mb-3 mt-4">2. Description</h2>
              <p className="mb-2">
                {eoi.description}
              </p>

              <h2 className="text-xl font-semibold mb-3 mt-4">3. Required Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Item Name</th>
                      <th className="p-2 border">Quantity</th>
                      <th className="p-2 border">Unit</th>
                      <th className="p-2 border">Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedItems.map((item) => (
                      <tr key={item.product.id} className="border-t">
                        <td className="p-2 border">{item.product.name}</td>
                        <td className="p-2 border text-center">{item.required_quantity}</td>
                        <td className="p-2 border text-center">{item.product.unit}</td>
                        <td className="p-2 border">{item.product.specifications}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Evaluation Criteria */}
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Evaluation Criteria</h2>
              <p className="mb-2">Responses will be evaluated based on the following criteria:</p>
              <div
                className="pl-6 list-disc"
                dangerouslySetInnerHTML={{ __html: eoi.evaluation_criteria }}
              />
            </section>

            {/* Required Documents */}
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Required Documents</h2>
              <p className="mb-2">Suppliers must submit the following documents:</p>

              {eoi.documents?.length > 0 ? (
                <ol className="pl-6 list-disc">
                  {eoi.documents.map((document) => (
                    <li key={document.id}>{document.name}</li>
                  ))}
                </ol>
              ) : (
                <p className="pl-6 italic text-gray-500">No documents required.</p>
              )}
            </section>

            {/* Submission Deadline */}
            {eoi.status === "published" && (
              <div className="mb-6 p-4 bg-gray-100 rounded text-red-600">
                <span className="font-semibold">Submission Deadline: </span>
                <span>{formatDate(eoi.submission_deadline)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-end space-x-4">
              {eoi.status === 'published' && (
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 mt-4"
                >
                  Submit Bid
                </Button>
              )}
            </div>
            <div>
              {!(eoi.status === "published" || eoi.status === "closed") && (
                <PublishEOIModal eoiId={eoi.id} />
              )}
            </div>
          </div>
        </div>
      </div >
    </AppLayout >
  );
}