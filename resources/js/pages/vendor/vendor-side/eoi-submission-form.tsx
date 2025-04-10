
import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { FileText, Upload } from 'lucide-react';

interface Product {
    id: number;
    name: string;
}

interface Category {
    id: number;
    category_name: string;
}

interface RequestItem {
    id: number;
    required_quantity: number;
    additional_specifications?: string | null;
    product: Product;
    category?: Category;
    provided_quantity?: number;
}

interface VendorDocument {
    id: number;
    name: string;
    file_path: string;
}

interface VendorEOISubmissionFormData {
    [key: string]: any;
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
        submitted_quantity: number;
    }[];
    submittedDocuments: {
        document_id: number;
        file: File | null;
        fileName?: string;
    }[];
    no_items_reason?: string; // New field for reason when not submitting items
}

interface Props {
    requestItems: RequestItem[];
    documents: VendorDocument[];
    eoi_id: number;
    eoi_number: string;
    vendor_id: number;
    vendor_name: string;
    vendor_address: string;
    allow_partial_item_submission: boolean;
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
    allow_partial_item_submission,
    isEditing = false,
    existingSubmission
}) => {
    // Filter out fulfilled items
    const filteredRequestItems = requestItems.filter(item =>
        !item.provided_quantity || item.required_quantity > (item.provided_quantity || 0)
    );

    // Group items by category (skipping uncategorized)
    const { groupedItems, hasValidCategories } = filteredRequestItems.reduce<{
        groupedItems: Record<number, { name: string; items: RequestItem[] }>;
        hasValidCategories: boolean;
    }>((acc, item) => {
        const category = item.category;

        if (!category) {
            console.warn(`Skipping item ${item.id} - no category found`);
            return acc;
        }

        if (!acc.groupedItems[category.id]) {
            acc.groupedItems[category.id] = {
                name: category.category_name,
                items: []
            };
        }

        acc.groupedItems[category.id].items.push(item);
        acc.hasValidCategories = true;
        return acc;
    }, { groupedItems: {}, hasValidCategories: false });

    // Convert to array for rendering
    const itemCategories = Object.entries(groupedItems).map(([id, group]) => ({
        id: parseInt(id),
        name: group.name,
        items: group.items
    }));

    // State management
    const [selectedCategories, setSelectedCategories] = useState<number[]>(
        // Initialize with categories from existing submission if editing
        isEditing && existingSubmission?.submittedItems?.length
            ? Array.from(new Set(existingSubmission.submittedItems.map(item => {
                const requestItem = filteredRequestItems.find(ri => ri.id === item.request_items_id);
                return requestItem?.category?.id;
            }).filter(Boolean) as number[]))
            : []
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionType, setSubmissionType] = useState<'draft' | 'submitted'>('draft');
    const [isSubmittingItems, setIsSubmittingItems] = useState(true); // New state to track if vendor is submitting items

    // Initialize the submitted items with required quantity
    const initialSubmittedItems = filteredRequestItems.map(item => ({
        request_items_id: item.id,
        actual_unit_price: '',
        actual_product_total_price: '',
        discount_rate: '',
        additional_specifications: item.additional_specifications,
        submitted_quantity: allow_partial_item_submission ? '' : undefined
    }));

    // Form setup
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
            : initialSubmittedItems,
        submittedDocuments: documents.map(doc => ({
            document_id: doc.id,
            file: null,
            fileName: existingSubmission?.submittedDocuments?.find(d => d.document_id === doc.id)?.fileName || '',
        })),
        no_items_reason: existingSubmission?.no_items_reason || '', // Initialize reason field
    });

    // Helper functions
    const toggleCategorySelection = (categoryId: number) => {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];

        setSelectedCategories(newCategories);

        // Recalculate total when category selection changes
        updateTotalPrice(newCategories);
    };

    const updateTotalPrice = (categories: number[]) => {
        const totalPrice = data.submittedItems.reduce((total, item) => {
            const requestItem = findRequestItemById(item.request_items_id);
            const categoryId = requestItem?.category?.id;
            const hasPrice = parseFloat(item.actual_unit_price) > 0;
            const hasQuantity = item.submitted_quantity > 0;

            return categoryId && categories.includes(categoryId) && hasPrice && hasQuantity
                ? total + parseFloat(item.actual_product_total_price || '0')
                : total;
        }, 0);

        setData('items_total_price', totalPrice.toFixed(2));
    };

    const findRequestItemById = (id: number) => {
        return filteredRequestItems.find(item => item.id === id);
    };

    const getItemIndexById = (id: number) => {
        return data.submittedItems.findIndex(item => item.request_items_id === id);
    };

    const handleItemChange = (index: number, field: string, value: string | number) => {
        const updatedItems = [...data.submittedItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        // Calculate total price if relevant fields change
        if (['actual_unit_price', 'discount_rate', 'submitted_quantity'].includes(field)) {
            const quantity = field === 'submitted_quantity'
                ? Number(value)
                : updatedItems[index].submitted_quantity;

            const unitPrice = parseFloat(updatedItems[index].actual_unit_price) || 0;
            const discountRate = parseFloat(updatedItems[index].discount_rate || '0') / 100;
            const totalPrice = (quantity * unitPrice) * (1 - discountRate);

            updatedItems[index].actual_product_total_price = totalPrice.toFixed(2);
        }

        // Update the data
        setData('submittedItems', updatedItems);

        // Recalculate total
        const totalPrice = updatedItems.reduce((total, item) => {
            const requestItem = findRequestItemById(item.request_items_id);
            const categoryId = requestItem?.category?.id;
            const hasPrice = parseFloat(item.actual_unit_price) > 0;
            const hasQuantity = item.submitted_quantity > 0;

            return categoryId && selectedCategories.includes(categoryId) && hasPrice && hasQuantity
                ? total + parseFloat(item.actual_product_total_price || '0')
                : total;
        }, 0);

        setData('items_total_price', totalPrice.toFixed(2));
    };

    const handleDocumentUpload = (index: number, file: File) => {
        const updatedDocuments = [...data.submittedDocuments];
        updatedDocuments[index] = {
            ...updatedDocuments[index],
            file,
            fileName: file.name
        };
        setData('submittedDocuments', updatedDocuments);
    };

    const store = () => {
        const formData = new FormData();

        // Add ID if editing
        if (isEditing && data.id) {
            formData.append('id', String(data.id));
            formData.append('_method', 'PUT');
        }

        // Basic data
        formData.append('eoi_id', String(data.eoi_id || eoi_id));
        formData.append('vendor_id', String(data.vendor_id || vendor_id));
        formData.append('submission_date', data.submission_date);
        formData.append('delivery_date', data.delivery_date);
        formData.append('remarks', data.remarks);
        formData.append('items_total_price', data.items_total_price);
        formData.append('status', submissionType);
        
        // Add flag and reason if not submitting items
        formData.append('is_submitting_items', String(isSubmittingItems));
        if (!isSubmittingItems && data.no_items_reason) {
            formData.append('no_items_reason', data.no_items_reason);
        }

        // Terms and conditions
        if (data.terms_and_conditions instanceof File) {
            formData.append('terms_and_conditions', data.terms_and_conditions);
        }

        // Items from selected categories only - filter out items without price or quantity
        if (isSubmittingItems) {
            let itemIndex = 0;
            data.submittedItems.forEach((item, originalIndex) => {
                const requestItem = findRequestItemById(item.request_items_id);
                const categoryId = requestItem?.category?.id;
                const hasPrice = parseFloat(item.actual_unit_price) > 0;
                const hasQuantity = item.submitted_quantity > 0;

                if (categoryId &&
                    selectedCategories.includes(categoryId) &&
                    (submissionType === 'draft' || (hasPrice && hasQuantity))
                ) {
                    formData.append(`submittedItems[${itemIndex}][request_items_id]`, String(item.request_items_id));
                    formData.append(`submittedItems[${itemIndex}][actual_unit_price]`, item.actual_unit_price);
                    formData.append(`submittedItems[${itemIndex}][actual_product_total_price]`, item.actual_product_total_price);
                    formData.append(`submittedItems[${itemIndex}][submitted_quantity]`, String(item.submitted_quantity));

                    if (item.discount_rate) {
                        formData.append(`submittedItems[${itemIndex}][discount_rate]`, item.discount_rate);
                    }
                    if (item.additional_specifications) {
                        formData.append(`submittedItems[${itemIndex}][additional_specifications]`, item.additional_specifications);
                    }

                    itemIndex++;
                }
            });
        }

        // Documents
        data.submittedDocuments.forEach((doc, index) => {
            formData.append(`submittedDocuments[${index}][document_id]`, String(doc.document_id));
            if (doc.file) {
                formData.append(`submittedDocuments[${index}][file]`, doc.file);
            }
        });

        // Submit
        const url = isEditing && data.id
            ? `/vendor/${data.id}/submission`
            : `/vendor/${eoi_id}/submission`;

        if (isEditing && data.id) {
            put(url, {
                data: formData,
                forceFormData: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    reset();
                },
                onError: () => setIsSubmitting(false)
            });
        } else {
            post(url, {
                data: formData,
                forceFormData: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    reset();
                },
                onError: () => setIsSubmitting(false)
            });
        }
    };

    useEffect(() => {
        if (isSubmitting && !processing) {
            store();
        }
    }, [isSubmitting]);

    // Recalculate total price on initial load
    useEffect(() => {
        if (selectedCategories.length > 0) {
            updateTotalPrice(selectedCategories);
        }
    }, []);

    // If existing submission has no items, set isSubmittingItems to false when editing
    useEffect(() => {
        if (isEditing && existingSubmission && (!existingSubmission.submittedItems || existingSubmission.submittedItems.length === 0)) {
            setIsSubmittingItems(false);
        }
    }, [isEditing, existingSubmission]);

    const validateForm = () => {
        // If not submitting items, check if reason is provided
        if (!isSubmittingItems) {
            if (!data.no_items_reason) {
                alert('Please provide a reason for not submitting any items');
                return false;
            }
            return true;
        }
        
        // Otherwise, validate that at least one category is selected
        if (selectedCategories.length === 0) {
            alert('Please select at least one category or choose not to submit items');
            return false;
        }
        return true;
    };

    const validateFullSubmission = () => {
        // Skip validation if not submitting items
        if (!isSubmittingItems) {
            return true;
        }
        
        // Validate that all selected items have prices and quantities
        const hasInvalidItems = data.submittedItems.some(item => {
            const requestItem = findRequestItemById(item.request_items_id);
            const categoryId = requestItem?.category?.id;

            return categoryId &&
                selectedCategories.includes(categoryId) &&
                (parseFloat(item.actual_unit_price) <= 0 || item.submitted_quantity <= 0);
        });

        if (hasInvalidItems) {
            alert('Please provide valid prices and quantities for all selected items');
            return false;
        }

        return true;
    };

    const saveAsDraft = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmissionType('draft');
        setIsSubmitting(true);
    };

    const submitForReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!validateFullSubmission()) return;

        setSubmissionType('submitted');
        setIsSubmitting(true);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'EOI Submissions', href: '/vendor/eoi-submissions' },
        {
            title: isEditing ? 'Edit Submission' : 'New Submission',
            href: isEditing ? `/vendor/eoi-submissions/${existingSubmission?.id}/edit` : '/vendor/eoi-submissions/create'
        }
    ];
console.log(errors);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Submission for EOI: {eoi_number}
                </h1>

                <header className="mb-8 text-center">
                    <div className="text-2xl font-semibold">{vendor_name}</div>
                    <div className="font-semibold">{vendor_address}</div>
                </header>

                <form>
                    {/* Category Selection */}
                    <section className="mb-8 p-6 border rounded-lg bg-gray-50">
                        <h2 className="text-xl font-semibold mb-4">Select Categories</h2>

                        {filteredRequestItems.length > 0 ? (
                            hasValidCategories ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {itemCategories.map(category => (
                                        <div
                                            key={category.id}
                                            className={`p-4 border rounded cursor-pointer transition-colors ${selectedCategories.includes(category.id)
                                                ? 'bg-blue-50 border-blue-300'
                                                : 'bg-white hover:bg-gray-100'
                                                }`}
                                            onClick={() => toggleCategorySelection(category.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategories.includes(category.id)}
                                                        readOnly
                                                        className="mr-2 h-4 w-4"
                                                    />
                                                    <span className="font-medium">{category.name}</span>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {category.items.length} item{category.items.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-600">
                                        No valid categories found. Please ensure all products have categories assigned.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-yellow-600">All requested items have been fulfilled.</p>
                            </div>
                        )}
                    </section>

                    {/* Items Section */}
                    <section className="mb-8 min-h-64">
                        <h2 className="text-xl font-semibold mb-4">Quoted Items</h2>

                        {hasValidCategories ? (
                            selectedCategories.length > 0 ? (
                                <>
                                    {itemCategories
                                        .filter(cat => selectedCategories.includes(cat.id))
                                        .map(category => (
                                            <div key={category.id} className="mb-8 p-6 border rounded-lg bg-gray-50">
                                                <h3 className="font-semibold p-3 bg-gray-200 rounded mb-3">
                                                    {category.name}
                                                </h3>

                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-200">
                                                            <th className="p-2 border text-left">Product</th>
                                                            <th className="p-2 border text-center">Required Quantity</th>
                                                            <th className="p-2 border text-center">Submit Quantity*</th>
                                                            <th className="p-2 border text-center">Unit Price*</th>
                                                            <th className="p-2 border text-center">Discount (%)</th>
                                                            <th className="p-2 border text-center">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {category.items.map(item => {
                                                            const index = getItemIndexById(item.id);
                                                            if (index === -1) return null;

                                                            return (
                                                                <tr key={item.id} className="hover:bg-gray-50">
                                                                    <td className="p-2 border">
                                                                        <input
                                                                            type="text"
                                                                            value={item.product.name}
                                                                            readOnly
                                                                            className="w-full p-1 bg-transparent border-none"
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border text-center">
                                                                        <input
                                                                            type="number"
                                                                            value={item.required_quantity}
                                                                            readOnly
                                                                            className="w-full p-1 text-center bg-transparent border-none"
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border">
                                                                        {allow_partial_item_submission ? (
                                                                            <input
                                                                                type="number"
                                                                                min="1"
                                                                                max={item.required_quantity}
                                                                                value={data.submittedItems[index].submitted_quantity || ''}
                                                                                onChange={(e) => handleItemChange(
                                                                                    index,
                                                                                    'submitted_quantity',
                                                                                    e.target.value ? Math.max(1, Math.min(item.required_quantity, Number(e.target.value))) : ''
                                                                                )}
                                                                                className="w-full p-1 text-center border rounded"
                                                                                placeholder="Enter quantity"
                                                                            />
                                                                        ) : (
                                                                            <input
                                                                                type="number"
                                                                                value={item.required_quantity}
                                                                                readOnly
                                                                                className="w-full p-1 text-center bg-transparent border-none"
                                                                            />
                                                                        )}
                                                                    </td>
                                                                    <td className="p-2 border">
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0.01"
                                                                            value={data.submittedItems[index].actual_unit_price}
                                                                            onChange={(e) => handleItemChange(index, 'actual_unit_price', e.target.value)}
                                                                            className="w-full p-1 text-center border rounded"
                                                                            required
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border">
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            max="100"
                                                                            value={data.submittedItems[index].discount_rate || ''}
                                                                            onChange={(e) => handleItemChange(index, 'discount_rate', e.target.value)}
                                                                            className="w-full p-1 text-center border rounded"
                                                                            placeholder="0"
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border text-center">
                                                                        <input
                                                                            type="text"
                                                                            value={data.submittedItems[index].actual_product_total_price}
                                                                            readOnly
                                                                            className="w-full p-1 text-center bg-transparent border-none"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))
                                    }

                                    <div className="flex justify-end border-t pt-4 pr-6">
                                        <div className="text-right font-bold">
                                            Total: {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD'
                                            }).format(parseFloat(data.items_total_price) || 0)}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 border rounded-lg bg-blue-50 flex items-center justify-center h-32">
                                    <p className="text-blue-600 text-center">
                                        Please select at least one category above to see items.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="p-4 border rounded-lg bg-red-50 flex items-center justify-center h-32">
                                <p className="text-red-600 text-center">
                                    No valid categories available. Please contact an administrator.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Submission Details */}
                    <section className="mb-8 p-6 border rounded-lg bg-gray-50">
                        <h2 className="text-xl font-semibold mb-4">Submission Details</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Delivery Date*</label>
                                <input
                                    type="date"
                                    value={data.delivery_date}
                                    onChange={(e) => setData('delivery_date', e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                {errors.delivery_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.delivery_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setData('terms_and_conditions', e.target.files[0]);
                                        }
                                    }}
                                    className="w-full p-2 border rounded"
                                />
                                {data.terms_and_conditions instanceof File && (
                                    <div className="mt-2 text-sm text-green-600 flex items-center">
                                        <FileText size={16} className="mr-2" />
                                        {data.terms_and_conditions.name}
                                    </div>
                                )}
                                {errors.terms_and_conditions && (
                                    <p className="mt-1 text-sm text-red-600">{errors.terms_and_conditions}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Remarks</label>
                            <textarea
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                className="w-full p-2 border rounded h-24"
                                placeholder="Additional notes..."
                            />
                        </div>
                    </section>

                    {/* Documents Section */}
                    <section className="mb-8 p-6 border rounded-lg bg-gray-50">
                        <h2 className="text-xl font-semibold mb-4">Required Documents</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.submittedDocuments.map((doc, index) => (
                                <div key={doc.document_id} className="p-4 border rounded bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="font-medium">
                                            {documents[index].name}
                                        </label>
                                        <div>
                                            <input
                                                type="file"
                                                id={`doc-${doc.document_id}`}
                                                onChange={(e) => e.target.files?.[0] && handleDocumentUpload(index, e.target.files[0])}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor={`doc-${doc.document_id}`}
                                                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer text-sm"
                                            >
                                                <Upload size={14} className="mr-1" />
                                                {doc.file ? 'Change' : 'Upload'}
                                            </label>
                                        </div>
                                    </div>
                                    {doc.file && (
                                        <div className="flex items-center text-sm text-green-600 mt-1">
                                            <FileText size={14} className="mr-1" />
                                            {doc.fileName}
                                        </div>
                                    )}
                                    {errors[`submittedDocuments.${index}.file`] && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors[`submittedDocuments.${index}.file`]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 justify-end mt-6">
                        <button
                            type="button"
                            onClick={saveAsDraft}
                            disabled={processing || (!hasValidCategories && !isEditing)}
                            className={`px-6 py-2 rounded text-white ${processing
                                ? 'bg-gray-500'
                                : 'bg-gray-600 hover:bg-gray-700'
                                } disabled:opacity-50`}
                        >
                            {processing ? 'Processing...' : isEditing ? 'Update Draft' : 'Save Draft'}
                        </button>

                        <button
                            type="button"
                            onClick={submitForReview}
                            disabled={processing || (!hasValidCategories && !isEditing)}
                            className={`px-6 py-2 rounded text-white ${processing
                                ? 'bg-blue-500'
                                : 'bg-blue-600 hover:bg-blue-700'
                                } disabled:opacity-50`}
                        >
                            {processing ? 'Submitting...' : isEditing ? 'Update Submission' : 'Submit for Review'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default VendorEOISubmissionForm;