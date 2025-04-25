import React from 'react';
import { Head, router } from '@inertiajs/react';
import DOMPurify from 'dompurify'; 

// Interfaces
interface Product {
  id: number;
  name: string;
  unit: string;
  specifications: string;
  category: {
    category_name: string;
  } | null;
}

interface RequestItem {
  id: number;
  required_quantity: number;
  provided_quantity: number;
  product: Product;
}

interface Requisition {
  id: number;
  requestItems: RequestItem[];
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
  eoi_number: string;
  title: string;
  description: string;
  evaluation_criteria: string;
  created_at: string;
  publish_date: string | null;
  submission_opening_date: string | null;
  submission_deadline: string | null;
  status: 'draft' | 'published' | 'open' | 'closed' | 'under_selection';
  requisitions: Requisition[];
  created_by: User;
  documents: Document[];
}

interface AggregatedItem {
  id: number;
  name: string;
  unit: string;
  category: string;
  required_quantity: number;
}

interface PublicEOIProps {
  eoi: Eoi;
  aggregatedItems: AggregatedItem[];
  organizationName: string;
  organizationAddress: string;
}

export default function PublicEOIViews({ 
  eoi, 
  aggregatedItems, 
  organizationName, 
  organizationAddress 
}: PublicEOIProps) {
  // Sanitize HTML content
  const sanitizeHTML = (html: string) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  // Format date with null check
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Invalid date' 
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Check if submission is open
  const isSubmissionOpen = () => {
    if (eoi.status !== 'open') return false;
    if (!eoi.submission_deadline) return true;
    
    try {
      const deadline = new Date(eoi.submission_deadline);
      return !isNaN(deadline.getTime()) && deadline > new Date();
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <Head title={`EOI - ${eoi.title}`} />

      <div className="py-12">
        <div className="w-full mx-auto sm:px-6 lg:px-8">
          <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
            {/* Header Section */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-center mb-6">{eoi.title}</h1>

              <div className="flex justify-between mb-4">
                <div>
                  <span className="font-semibold">EOI Number: </span>
                  <span>{eoi.eoi_number}</span>
                </div>
                {eoi.status === "published" && eoi.publish_date ? (
                  <div>
                    <span className="font-semibold">Publish Date: </span>
                    <span>{formatDate(eoi.publish_date)}</span>
                  </div>
                ) : (eoi.status === "open" || eoi.status === "closed" || eoi.status === "under_selection") && eoi.submission_opening_date ? (
                  <div>
                    <span className="font-semibold">Submission Opening Date: </span>
                    <span>{formatDate(eoi.submission_opening_date)}</span>
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
                {eoi.description || 'No description provided.'}
              </p>

              <h2 className="text-xl font-semibold mb-3 mt-4">3. Required Items</h2>
              {aggregatedItems.length > 0 ? (
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
                      {aggregatedItems.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2 border">{item.name}</td>
                          <td className="p-2 border">{item.category}</td>
                          <td className="p-2 border text-center">{item.required_quantity}</td>
                          <td className="p-2 border text-center">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="italic text-gray-500">No items required.</p>
              )}
            </section>

            {/* Evaluation Criteria */}
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Evaluation Criteria</h2>
              {eoi.evaluation_criteria ? (
                <div
                  className="pl-6 prose max-w-none"
                  dangerouslySetInnerHTML={sanitizeHTML(eoi.evaluation_criteria)}
                />
              ) : (
                <p className="italic text-gray-500">No evaluation criteria specified.</p>
              )}
            </section>

            {/* Required Documents */}
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Required Documents</h2>
              {eoi.documents?.length > 0 ? (
                <ol className="pl-6 list-disc">
                  {eoi.documents.map((document) => (
                    <li key={document.id}>{document.name}</li>
                  ))}
                </ol>
              ) : (
                <p className="italic text-gray-500">No documents required.</p>
              )}
            </section>

            {/* Submission Deadline */}
            {eoi.status === "open" && eoi.submission_deadline && (
              <div className={`mb-6 p-4 rounded ${
                new Date(eoi.submission_deadline) < new Date() 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                <span className="font-semibold">Submission Deadline: </span>
                <span>
                  {formatDate(eoi.submission_deadline)}
                  {new Date(eoi.submission_deadline) < new Date() && ' (Deadline passed)'}
                </span>
              </div>
            )}
            
            <hr className="my-4" />
            <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 transition-colors"
                  onClick={() => router.visit(`/vendor/${eoi.id}/submission`)}
                >
                  Submit Bid
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}