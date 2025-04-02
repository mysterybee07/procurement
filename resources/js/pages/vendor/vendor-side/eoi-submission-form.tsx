import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { PlusCircle, Trash2, FileText, Upload } from 'lucide-react';

// Interfaces
interface Product {
    id: number;
    name: string;
}

interface RequestItem {
    id: number;
    required_quantity: number;
    additional_specifications?: string | null;
    product: Product;
    // Added provided_quantity to filter items
    provided_quantity?: number;
}

interface VendorDocument {
    id: number;
    name: string;
    file_path: string;
}

// Updated interface to include index signature
interface VendorEOISubmissionFormData {
    [key: string]: any; // Index signature to satisfy FormDataType
    id?: number;
    eoi_id?: number;
    vendor_id?: number;
    submission_date: string;
    delivery_date: string;
    terms_and_conditions: File | string | null;
    remarks: string;
    items_total_price: string;
    submittedItems: {
        request_items_id: number;
        actual_unit_price: string;
        actual_product_total_price: string;
        discount_rate?: string;
        additional_specifications?: string | null;
    }[];
    submittedDocuments: {
        document_id: number;
        file: File | null;
        fileName?: string;
    }[];
}

interface Props {
    requestItems: RequestItem[];
    documents: VendorDocument[];
    eoi_id: number;
    eoi_number: string;
    vendor_id: number;
    vendor_name: string;
    vendor_address: string;
    isEditing?: boolean;
    existingSubmission?: Partial<VendorEOISubmissionFormData>;
}

const VendorEOISubmissionForm: React.FC<Props> = ({
    requestItems,
    documents,
    eoi_id,
    vendor_id,
    eoi_number,
    vendor_name,
    vendor_address,
    isEditing = false,
    existingSubmission
}) => {
    // Filter out request items where required_quantity equals provided_quantity
    const filteredRequestItems = requestItems.filter(item => 
        !item.provided_quantity || item.required_quantity > (item.provided_quantity || 0)
    );

    // Breadcrumb configuration
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'EOI Submissions',
            href: '/vendor/eoi-submissions',
        },
        {
            title: isEditing ? 'Edit EOI Submission' : 'Create EOI Submission',
            href: isEditing ? `/vendor/eoi-submissions/${existingSubmission?.id}/edit` : '/vendor/eoi-submissions/create',
        },
    ];

    // Initial form data setup
    const { data, setData, post, put, errors, processing, reset } = useForm<VendorEOISubmissionFormData>({
        id: existingSubmission?.id,
        eoi_id: eoi_id,
        vendor_id: vendor_id,
        submission_date: existingSubmission?.submission_date || new Date().toISOString().split('T')[0],
        delivery_date: existingSubmission?.delivery_date || '',
        terms_and_conditions: existingSubmission?.terms_and_conditions || null,
        remarks: existingSubmission?.remarks || '',
        items_total_price: existingSubmission?.items_total_price || '0',
        submittedItems: existingSubmission?.submittedItems?.length
            ? existingSubmission.submittedItems
            : filteredRequestItems.map(item => ({
                request_items_id: item.id,
                actual_unit_price: '',
                actual_product_total_price: '',
                discount_rate: '',
                additional_specifications: item.additional_specifications
            })),
        submittedDocuments: documents.map(doc => ({
            document_id: doc.id,
            file: null,
            fileName: '',
        })),
    });

    // State for submission process
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionType, setSubmissionType] = useState<'draft' | 'submitted'>('draft');

    // Store method to handle form submission
    const store = () => {
        const formData = new FormData();

        // Append basic submission data
        formData.append('eoi_id', (data.eoi_id || eoi_id).toString());
        formData.append('vendor_id', (data.vendor_id || vendor_id).toString());
        formData.append('submission_date', data.submission_date);
        formData.append('delivery_date', data.delivery_date);
        formData.append('remarks', data.remarks);
        formData.append('items_total_price', data.items_total_price);

        // Append terms and conditions file
        if (data.terms_and_conditions instanceof File) {
            formData.append('terms_and_conditions', data.terms_and_conditions);
        }

        // Append submitted items
        data.submittedItems.forEach((item, index) => {
            formData.append(`submittedItems[${index}][request_items_id]`, item.request_items_id.toString());
            formData.append(`submittedItems[${index}][actual_unit_price]`, item.actual_unit_price);
            formData.append(`submittedItems[${index}][actual_product_total_price]`, item.actual_product_total_price);

            if (item.discount_rate) {
                formData.append(`submittedItems[${index}][discount_rate]`, item.discount_rate);
            }

            if (item.additional_specifications) {
                formData.append(`submittedItems[${index}][additional_specifications]`, item.additional_specifications);
            }
        });

        // Append submitted documents
        data.submittedDocuments.forEach((doc, index) => {
            formData.append(`submittedDocuments[${index}][document_id]`, doc.document_id.toString());

            if (doc.file) {
                formData.append(`submittedDocuments[${index}][file]`, doc.file);
            }
        });

        // Perform the submission
        if (isEditing && data.id) {
            // For editing existing submission
            put(`/vendor/eoi-submissions/${data.id}`, {
                data: formData,
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error('Submission Error:', errors);
                    setIsSubmitting(false);
                }
            });
        } else {
            // For creating new submission
            post(`/vendor/${eoi_id}/submission`, {
                data: formData,
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error('Submission Error:', errors);
                    setIsSubmitting(false);
                }
            });
        }
    };

    // Effect to trigger submission
    useEffect(() => {
        if (isSubmitting) {
            store();
        }
    }, [isSubmitting]);

    // Handler for item changes
    const handleItemChange = (
        index: number,
        field: string,
        value: string
    ) => {
        const updatedItems = [...data.submittedItems];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };

        // Auto-calculate total price if unit price or discount is updated
        if (field === 'actual_unit_price' || field === 'discount_rate') {
            const quantity = filteredRequestItems[index].required_quantity;
            const unitPrice = parseFloat(updatedItems[index].actual_unit_price) || 0;
            const discountRate = parseFloat(updatedItems[index].discount_rate || '0') / 100;

            const totalPriceBeforeDiscount = quantity * unitPrice;
            const discountAmount = totalPriceBeforeDiscount * discountRate;
            const totalPriceAfterDiscount = totalPriceBeforeDiscount - discountAmount;

            updatedItems[index].actual_product_total_price = totalPriceAfterDiscount.toFixed(2);
        }

        // Recalculate total price
        const totalPrice = updatedItems.reduce((total, item) =>
            total + parseFloat(item.actual_product_total_price || '0'), 0);

        setData('submittedItems', updatedItems);
        setData('items_total_price', totalPrice.toFixed(2));
    };

    // Handler for document upload
    const handleDocumentUpload = (index: number, file: File) => {
        const updatedDocuments = [...data.submittedDocuments];
        updatedDocuments[index] = {
            ...updatedDocuments[index],
            file,
            fileName: file.name
        };
        setData('submittedDocuments', updatedDocuments);
    };

    // Submission methods
    const saveAsDraft = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionType('draft');
        setIsSubmitting(true);
    };

    const submitForReview = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionType('submitted');
        setIsSubmitting(true);
    };

    // Check if we have any items to render
    const hasItems = filteredRequestItems.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
                    {/* Form Title */}
                    <h1 className="text-2xl font-bold mb-6 justify-center flex">
                        Submission for EOI Number: {eoi_number}
                    </h1>

                    {/* Vendor Information */}
                    <header className='mb-8'>
                        <div className="text-center mb-2">
                            <span className="font-semibold text-2xl">{vendor_name}</span>
                        </div>
                        <div className="text-center mb-4">
                            <span className="font-semibold">{vendor_address}</span>
                        </div>
                    </header>

                    <form>
                        {/* Submitted Items Section */}
                        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
                            <h2 className="text-xl font-semibold mb-4">Items With Quoted Price</h2>
                            
                            {hasItems ? (
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="p-2 border text-left">Product</th>
                                            <th className="p-2 border text-center">Quantity</th>
                                            <th className="p-2 border text-center">Unit Price*</th>
                                            <th className="p-2 border text-center">Discount Rate (%)</th>
                                            <th className="p-2 border text-center">Total Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.submittedItems.map((item, index) => (
                                            <tr key={item.request_items_id} className="hover:bg-gray-50">
                                                <td className="p-2 border">
                                                    <input
                                                        type="text"
                                                        value={filteredRequestItems[index].product.name}
                                                        readOnly
                                                        className="w-full p-1 border-none bg-transparent"
                                                    />
                                                </td>
                                                <td className="p-2 border text-center">
                                                    <input
                                                        type="number"
                                                        value={filteredRequestItems[index].required_quantity}
                                                        readOnly
                                                        className="w-full p-1 text-center border-none bg-transparent"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.actual_unit_price}
                                                        onChange={(e) => handleItemChange(index, 'actual_unit_price', e.target.value)}
                                                        className="w-full p-1 text-center border rounded"
                                                        required
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.discount_rate || ''}
                                                        onChange={(e) => handleItemChange(index, 'discount_rate', e.target.value)}
                                                        className="w-full p-1 text-center border rounded"
                                                        placeholder="Optional"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.actual_product_total_price}
                                                        readOnly
                                                        className="w-full p-1 text-center border-none bg-transparent"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-center">
                                    <p className="text-yellow-600">All requested items have already been fulfilled.</p>
                                </div>
                            )}
                        </div>

                        {/* Submission Details Section */}
                        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
                            <h2 className="text-xl font-semibold mb-4">Submission Details</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Terms and Conditions</label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData('terms_and_conditions', e.target.files[0]);
                                        }
                                    }}
                                    className="w-full p-2 border rounded"
                                />
                                {data.terms_and_conditions instanceof File && (
                                    <div className="mt-2 text-sm text-green-600">
                                        <FileText size={16} className="inline-block mr-2" />
                                        {data.terms_and_conditions.name}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Remarks</label>
                                <textarea
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    className="w-full p-2 border rounded h-24"
                                    placeholder="Additional remarks..."
                                />
                            </div>
                        </div>

                        {/* Required Documents Section */}
                        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
                            <h2 className="text-xl font-semibold mb-4">Required Documents</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.submittedDocuments.map((doc, index) => (
                                    <div key={doc.document_id} className="p-4 border rounded bg-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-sm font-medium">
                                                {documents[index].name}
                                            </label>
                                            <div className="flex items-center">
                                                <input
                                                    type="file"
                                                    id={`document-${doc.document_id}`}
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            handleDocumentUpload(index, e.target.files[0]);
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor={`document-${doc.document_id}`}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                                                >
                                                    <Upload size={16} /> Upload
                                                </label>
                                            </div>
                                        </div>
                                        {doc.fileName && (
                                            <div className="flex items-center gap-2 text-sm text-green-600">
                                                <FileText size={16} />
                                                {doc.fileName}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Delivery Date*</label>
                            <input
                                type="date"
                                name="delivery_date"
                                value={data.delivery_date}
                                onChange={(e) => setData('delivery_date', e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                            {errors.delivery_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.delivery_date}</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            {isEditing ? (
                                <button
                                    type="button"
                                    onClick={saveAsDraft}
                                    disabled={processing || (!hasItems && !isEditing)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update Submission'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={submitForReview}
                                    disabled={processing || !hasItems}
                                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Submitting...' : 'Submit'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};

export default VendorEOISubmissionForm;