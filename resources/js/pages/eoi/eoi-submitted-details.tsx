import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { FileText, ExternalLink, Calendar, DollarSign } from 'lucide-react';

// Interfaces
interface Product {
    id: number;
    name: string;
}

interface RequestItem {
    id: number;
    required_quantity: number;
    provided_quantity:number;
    additional_specifications?: string | null;
    product: Product;
}

interface VendorSubmittedItem {
    id: number;
    request_items_id: number;
    actual_unit_price: string;
    actual_product_total_price: string;
    discount_rate?: string;
    submitted_quantity:number;
    additional_specifications?: string | null;
    request_item: RequestItem;
}

interface Vendor {
    id: number;
    vendor_name: string;
    address: string;
}

interface EOI {
    id: number;
    eoi_number: string;
}

interface VendorEoiSubmission {
    id: number;
    eoi_id: number;
    vendor_id: number;
    submission_date: string;
    delivery_date: string;
    remarks: string;
    items_total_price: string;
    vendor: Vendor;
    eoi: EOI;
    vendor_submitted_items: VendorSubmittedItem[];
}

interface Props {
    submission: VendorEoiSubmission;
    flash: {
        message?: string;
        error?: string;
    };
}

const EOISubmittedDetails: React.FC<Props> = ({ submission, flash }) => {
    console.log(submission)
    // Breadcrumb configuration
    const breadcrumbs = [
        {
            title: 'EOI Submissions',
            href: '/vendor/eoi-submissions',
        },
        {
            title: `EOI Submission #${submission.id}`,
            href: `/vendor/eoi-submissions/${submission.id}`,
        },
    ];

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Flash Messages */}
            {flash.message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {flash.message}
                </div>
            )}
            {flash.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {flash.error}
                </div>
            )}

            <div className="flex items-center justify-center bg-gray-100 p-6">
                <div className="w-full max-w-4xl bg-white rounded-lg shadow-md">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-2xl font-bold mb-2 text-center">
                            EOI Submission Details
                        </h1>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-semibold">EOI Number: {submission.eoi.eoi_number}</span>
                            <span className="text-lg font-semibold mt-2">{submission.vendor.vendor_name}</span>
                            {/* <span className="text-gray-600">{submission.vendor.address}</span> */}
                        </div>
                    </div>

                    {/* Submission Overview */}
                    <div className="p-6 border-b border-gray-200">
                        {/* <h2 className="text-xl font-semibold mb-4">Submission Overview</h2> */}

                        <div className="flex justify-between px-8">
                            <div className="flex items-center gap-2">
                                <Calendar className="text-blue-600" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Submission Date</p>
                                    <p className="font-medium">{formatDate(submission.submission_date)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar className="text-blue-600" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Target Delivery Date</p>
                                    <p className="font-medium">{formatDate(submission.delivery_date)}</p>
                                </div>
                            </div>

                            {/* <div className="flex items-center gap-2">
                <DollarSign className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">${parseFloat(submission.items_total_price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
              </div> */}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold mb-4">Quote Details</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left border border-gray-200">Product</th>
                                        <th className="p-3 text-center border border-gray-200">Submitted Quantity</th>
                                        <th className="p-3 text-center border border-gray-200">Unit Price</th>
                                        <th className="p-3 text-center border border-gray-200">Discount</th>
                                        <th className="p-3 text-center border border-gray-200">Total Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submission.vendor_submitted_items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="p-3 border border-gray-200">
                                                {item.request_item.product.name}
                                            </td>
                                            <td className="p-3 text-center border border-gray-200">
                                                {item.submitted_quantity}
                                            </td>
                                            <td className="p-3 text-center border border-gray-200">
                                                ${parseFloat(item.actual_unit_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-3 text-center border border-gray-200">
                                                {item.discount_rate ? `${item.discount_rate}%` : '-'}
                                            </td>
                                            <td className="p-3 text-center border border-gray-200">
                                                ${parseFloat(item.actual_product_total_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Total Row */}
                                    <tr className="bg-gray-100 font-semibold">
                                        <td colSpan={4} className="p-3 text-right border border-gray-200">
                                            Total Amount:
                                        </td>
                                        <td className="p-3 text-center border border-gray-200">
                                            ${parseFloat(submission.items_total_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Remarks Section */}
                    {submission.remarks && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Remarks</h2>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p>{submission.remarks}</p>
                            </div>
                        </div>
                    )}

                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold mb-4">Submitted Files</h2>

                        <div className="flex justify-between px-8">
                            <div className="flex items-center gap-2">
                                <ExternalLink className="text-blue-600" size={20} />
                                <a href={`/submissions/${submission.id}/documents`} className="text-md text-gray-600 hover:underline">
                                    Documents
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <ExternalLink className="text-blue-600" size={20} />
                                <p className="text-md text-gray-600">Terms and Conditions</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6">
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => window.history.back()}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default EOISubmittedDetails;