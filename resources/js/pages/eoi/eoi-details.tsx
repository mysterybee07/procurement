import React from 'react';
import { Head, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import PublishEOIModal from '@/components/publish-eoi-modal';
import SelectWorkflowModal from '../approval-workflow/select-approval-workflow-modal';
import OpenEOIModal from '@/components/open-submission-eoi-modal';

// Interfaces

interface ApprovalWorkflow {
  id: number;
  workflow_name: string;
}
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

// Updated to match backend structure
interface AggregatedItem {
  name: string;
  unit: string;
  category: string;
  required_quantity: number;
}

interface EOIProps {
  eoi: Eoi;
  aggregatedItems: AggregatedItem[];
  approvalWorkflows: ApprovalWorkflow[];
  flash: {
    message: string;
    error: string;
  };
  organizationName?: string;
  organizationAddress?: string;
}

export default function EOIDetails({ approvalWorkflows, eoi, aggregatedItems, flash, organizationName = "Whetstone Associates", organizationAddress = "Sankhamul, Kathmandu" }: EOIProps) {
  const { auth } = usePage().props as any;
  const user = auth?.user;
  console.log(approvalWorkflows);

  // const approvalWorkflows = [
  //   { id: 1, name: 'Workflow 1' },
  //   { id: 2, name: 'Workflow 2' },
  //   { id: 3, name: 'Workflow 3' },
  // ];

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
                <span className="font-semibold text-2xl">{organizationName}</span>
              </div>

              <div className="text-center mb-4">
                <span className="font-semibold">{organizationAddress}</span>
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
                      <th className="p-2 border">Category</th>
                      <th className="p-2 border">Quantity</th>
                      <th className="p-2 border">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedItems.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2 border">{item.name}</td>
                        <td className="p-2 border">{item.category}</td>
                        <td className="p-2 border text-center">{item.required_quantity}</td>
                        <td className="p-2 border text-center">{item.unit}</td>
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
            {(eoi.status === "open" || eoi.status === "under_selection") && (
              <div className="mb-6 p-4 bg-gray-100 rounded text-red-600">
                <span className="font-semibold">Submission Deadline: </span>
                {new Date(eoi.submission_deadline) < new Date() ? (
                  <span>Deadline crossed</span>
                ) : (
                  <span>{formatDate(eoi.submission_deadline)}</span>
                )}
              </div>
            )}
            <hr />
            <div className="flex justify-end space-x-4">
              {eoi.status === "open" && user.is_vendor && (
                <Button
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 mt-4"
                  onClick={() => router.visit(`/vendor/${eoi.id}/submission`)}
                >
                  Submit Bid
                </Button>
              )}
            </div>
            <div>
              {eoi.status === "approved" &&
                !["published", "closed", "under_selection", "open", "draft"].includes(eoi.status) &&
                user.permissions.includes('publish eois') && (
                  <PublishEOIModal eoiId={eoi.id} />
                )}
              {eoi.status === "published" && (
                <OpenEOIModal eoiId={eoi.id} />
              )}
            </div>
            {eoi.status === "draft" && (
              <SelectWorkflowModal approval_workflows={approvalWorkflows} entity_id={eoi.id} entity_type='eoi' />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}