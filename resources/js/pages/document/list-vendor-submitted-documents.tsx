import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Submitted Documents',
    href: '/dashboard',
  },
];

interface Vendor {
    id: number;
    vendor_name: string;
    email: string;
}

interface Document{
    name:string
}


interface VendorEoiDocument {
    id: number;
    file_path: string;
    status: string;
    vendor: Vendor;
    document:Document;
    created_at: string;
    updated_at: string;
}

interface Props {
    flash: {
        message?: string;
        error?: string;
    };
    documents: VendorEoiDocument[];
    eoiSubmissionId: number;
}

const ListVendorSubmittedDocuments: React.FC<Props> = ({ flash, documents }) => {
    const getFileIcon = (filePath: string) => {
        const extension = filePath.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'pdf':
                return (
                    <div className="p-3 rounded-full bg-red-50">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                );
            case 'doc':
            case 'docx':
                return (
                    <div className="p-3 rounded-full bg-blue-50">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                );
            case 'xls':
            case 'xlsx':
                return (
                    <div className="p-3 rounded-full bg-green-50">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                );
            case 'jpg':
            case 'jpeg':
            case 'png':
                return (
                    <div className="p-3 rounded-full bg-purple-50">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="p-3 rounded-full bg-gray-50">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                );
        }
    };

    const getFileName = (filePath: string) => {
        return filePath.split('/').pop() || 'document';
    };

    const getFormattedDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleAction = (id: number, action: 'approve' | 'reject') => {
        const routeName = action === 'approve' ? 'document.approve' : 'document.reject';

        router.post(route(routeName, { document: id }), {
            comments: '',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="EOIs" />

            <div className="py-12">
                <div className="w-full mx-auto sm:px-6 lg:px-8">
                    {/* <h2 className="text-xl font-bold mb-4">Recent EOIs</h2> */}

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
                    <h1 className="text-2xl font-bold text-gray-900">
                        Documents for EOI Submission {documents.length > 0 && `of ${documents[0].vendor.vendor_name}`}
                    </h1>
                    {documents.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            {documents.length} document{documents.length !== 1 ? 's' : ''} submitted
                        </p>
                    )}
                
                    {/* Documents Grid */}
                    {documents.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h4 className="mt-2 text-lg font-medium text-gray-900">No documents submitted yet</h4>
                            <p className="mt-1 text-sm text-gray-500">This vendor hasn't submitted any documents for this EOI.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {documents.map((doc) => (
                                <div key={doc.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="p-4 bg-gray-50 border-b flex items-center space-x-4">
                                        {getFileIcon(doc.file_path)}
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {getFileName(doc.document.name)}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate">
                                                Submitted by: {doc.vendor.vendor_name}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Uploaded: {getFormattedDate(doc.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex flex-col space-y-3">
                                            <div className="flex space-x-2">
                                                <a
                                                    href={`/storage/${doc.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center flex-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </a>
                                                <a
                                                    href={`/storage/${doc.file_path}`}
                                                    download
                                                    className="inline-flex items-center justify-center flex-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download
                                                </a>
                                            </div>
                                            {!(doc.status === "accepted" || doc.status === "rejected") && (
                                                <div className="flex space-x-2 pt-2 border-t">
                                                    <button
                                                        className="inline-flex items-center justify-center flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors duration-150"
                                                        onClick={() => handleAction(doc.id, 'approve')}
                                                    >
                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                        </svg>
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="inline-flex items-center justify-center flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors duration-150"
                                                        onClick={() => handleAction(doc.id, 'reject')}
                                                    >
                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                        </svg>
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default ListVendorSubmittedDocuments;