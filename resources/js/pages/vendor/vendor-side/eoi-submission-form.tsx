import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import React, { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';

interface Product {
    id: number;
    name: string;
}

interface Document {
    id: number;
    name: string;
    type?: string;
    is_mandatory: boolean;
}

interface RequestItem {
    id: number;
    product: Product;
    required_quantity: number;
    additional_specifications?: string;
}

interface VendorSubmittedItem {
    request_items_id: number;
    product_name: string;
    required_quantity: number;
    actual_unit_price: number;
    actual_product_total_price: number;
    discount_rate?: number;
    can_provide: boolean;
}

interface SubmittedDocument {
    document_id: number;
    file: File | null;
    document_name: string;
}

interface Props {
    requestItems: RequestItem[];
    documents: Document[];
    eoi_id: number;
    vendor_id: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requisitions',
        href: '/requisitions',
    },
];

const VendorEOISubmissionForm: React.FC<Props> = ({
    requestItems,
    documents,
    eoi_id,
    vendor_id,
}) => {
    const [submissionDate] = useState(new Date().toISOString().split('T')[0]);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [termsAndConditions, setTermsAndConditions] = useState('');
    const [remarks, setRemarks] = useState('');
    const [status, setStatus] = useState<'draft' | 'submitted'>('draft');

    // Initialize submitted documents state
    const [submittedDocuments, setSubmittedDocuments] = useState<SubmittedDocument[]>(
        documents.map(doc => ({
            document_id: doc.id,
            file: null,
            document_name: doc.name
        }))
    );

    const [vendorSubmittedItems, setVendorSubmittedItems] = useState<VendorSubmittedItem[]>(
        requestItems.map(item => ({
            request_items_id: item.id,
            product_name: item.product.name,
            required_quantity: item.required_quantity,
            can_provide: false,
            actual_unit_price: 0,
            actual_product_total_price: 0,
            discount_rate: undefined
        }))
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleItemChange = (
        index: number,
        field: keyof VendorSubmittedItem,
        value: boolean | string | number | undefined
    ) => {
        const updatedItems = [...vendorSubmittedItems];
        const item = updatedItems[index];

        switch (field) {
            case 'can_provide':
                item.can_provide = value as boolean;
                if (!item.can_provide) {
                    item.actual_unit_price = 0;
                    item.actual_product_total_price = 0;
                    item.discount_rate = undefined;
                }
                break;
            case 'actual_unit_price':
                const unitPrice = Number(value);
                item.actual_unit_price = unitPrice;
                item.actual_product_total_price = unitPrice * item.required_quantity *
                    (1 - (item.discount_rate ? item.discount_rate / 100 : 0));
                break;
            case 'discount_rate':
                const discountRate = Number(value);
                item.discount_rate = discountRate;
                if (item.actual_unit_price) {
                    const discountedPrice = item.actual_unit_price * (1 - (discountRate / 100));
                    item.actual_product_total_price = discountedPrice * item.required_quantity;
                }
                break;
        }

        setVendorSubmittedItems(updatedItems);
    };

    // Handle document file upload
    const handleDocumentUpload = (index: number, file: File | null) => {
        const updatedDocuments = [...submittedDocuments];
        updatedDocuments[index].file = file;
        setSubmittedDocuments(updatedDocuments);
    };

    const calculateTotalPrice = () => {
        return vendorSubmittedItems
            .filter(item => item.can_provide)
            .reduce((total, item) => total + item.actual_product_total_price, 0);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Filter and validate submitted items
        const submittedItems = vendorSubmittedItems.filter(item => item.can_provide);

        // Validate items
        const isItemsValid = submittedItems.length > 0 && submittedItems.every(item =>
            item.actual_unit_price > 0 &&
            item.actual_product_total_price > 0
        );

        // Validate documents
        const isDocumentsValid = submittedDocuments.every(doc =>
            doc.file !== null
        );

        if (!isItemsValid) {
            alert('Please fill in all required fields for items you can provide');
            setIsSubmitting(false);
            return;
        }

        if (!isDocumentsValid) {
            alert('Please upload all required documents');
            setIsSubmitting(false);
            return;
        }

        // Prepare form data for submission
        const formData = new FormData();

        // Add base submission data
        formData.append('eoi_id', eoi_id.toString());
        formData.append('vendor_id', vendor_id.toString());
        formData.append('submission_date', submissionDate);
        formData.append('status', status);
        formData.append('delivery_date', deliveryDate);

        // Optional fields
        if (termsAndConditions) {
            formData.append('terms_and_conditions', termsAndConditions);
        }
        if (remarks) {
            formData.append('remarks', remarks);
        }

        // Add total price
        formData.append('items_total_price', calculateTotalPrice().toString());

        // Add submitted items
        submittedItems.forEach((item, index) => {
            formData.append(`vendorSubmittedItems[${index}][request_items_id]`, item.request_items_id.toString());
            formData.append(`vendorSubmittedItems[${index}][product_name]`, item.product_name);
            formData.append(`vendorSubmittedItems[${index}][required_quantity]`, item.required_quantity.toString());
            formData.append(`vendorSubmittedItems[${index}][actual_unit_price]`, item.actual_unit_price.toString());
            formData.append(`vendorSubmittedItems[${index}][actual_product_total_price]`, item.actual_product_total_price.toString());
            if (item.discount_rate) {
                formData.append(`vendorSubmittedItems[${index}][discount_rate]`, item.discount_rate.toString());
            }
        });

        // Add submitted documents
        submittedDocuments.forEach((doc, index) => {
            if (doc.file) {
                formData.append(`submittedDocuments[${index}][document_id]`, doc.document_id.toString());
                formData.append(`submittedDocuments[${doc.document_id}]`, doc.file);
            }
        });

        // Submit form
        router.post('/eoi/submission', formData, {
            onStart: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onSuccess: () => {
                alert('Submission successful!');
                // Optionally redirect or reset form
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                alert('Submission failed. Please check your inputs.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Expression of Interest (EOI) Submission</h1>

                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8">

                    {/* Request Items Table */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Required Items
                        </label>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-200">
                                    <tr>
                                        
                                        <th className="border p-2 text-center w-20">Can Provide</th>
                                        <th className="border p-2 text-left">Product Name</th>
                                        <th className="border p-2 text-center">Required Quantity</th>
                                        <th className="border p-2 text-left">Unit Price</th>
                                        <th className="border p-2 text-left">Discount (%)</th>
                                        <th className="border p-2 text-right">Total Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendorSubmittedItems.map((item, index) => (
                                        <tr key={item.request_items_id} className="hover:bg-gray-50">
                                            <td className="border p-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={item.can_provide}
                                                    onChange={(e) => handleItemChange(
                                                        index,
                                                        'can_provide',
                                                        e.target.checked
                                                    )}
                                                    className="form-checkbox h-5 w-5 text-blue-600"
                                                />
                                            </td>
                                            <td className="border p-2">{item.product_name}</td>
                                            <td className="border p-2 text-center">{item.required_quantity}</td>
                                            
                                            <td className="border p-2">
                                                <input
                                                    type="number"
                                                    value={item.actual_unit_price || ''}
                                                    onChange={(e) => handleItemChange(
                                                        index,
                                                        'actual_unit_price',
                                                        e.target.value
                                                    )}
                                                    disabled={!item.can_provide}
                                                    className="w-full p-2 border rounded"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Unit price"
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <input
                                                    type="number"
                                                    value={item.discount_rate || ''}
                                                    onChange={(e) => handleItemChange(
                                                        index,
                                                        'discount_rate',
                                                        e.target.value
                                                    )}
                                                    disabled={!item.can_provide}
                                                    className="w-full p-2 border rounded"
                                                    min="0"
                                                    max="100"
                                                    placeholder="Discount %"
                                                />
                                            </td>
                                            <td className="border p-2 text-right font-bold">
                                                {item.can_provide
                                                    ? item.actual_product_total_price.toFixed(2)
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} className="border p-2 text-right font-bold">
                                            Total Price:
                                        </td>
                                        <td className="border p-2 text-right font-bold">
                                            {calculateTotalPrice().toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Documents Upload Section */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Required Documents
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {submittedDocuments.map((doc, index) => (
                                <div key={doc.document_id} className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        {doc.document_name}
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files ? e.target.files[0] : null;
                                            handleDocumentUpload(index, file);
                                        }}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                    {doc.file && (
                                        <p className="text-sm text-green-600 mt-2">
                                            {doc.file.name} uploaded
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Terms and Conditions */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Terms and Conditions
                        </label>
                        <textarea
                            value={termsAndConditions}
                            onChange={(e) => setTermsAndConditions(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            rows={3}
                        />
                    </div>

                    {/* Remarks */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Remarks
                        </label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            rows={3}
                        />
                    </div>

                    {/* Submission Details */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Delivery Date
                        </label>
                        <input
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default VendorEOISubmissionForm;