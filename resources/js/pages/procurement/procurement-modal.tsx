import React, { useState, useRef, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { X, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface Product {
    id: number;
    name: string;
}

interface RequestItem {
    product_id: number;
    required_quantity: string;
    additional_specifications: string;
}

interface RequisitionFormData {
    required_date: string;
    status: string;
    urgency: string;
    requestItems: RequestItem[];
    [key: string]: any;
}

interface Props {
    products: Product[];
    buttonLabel?: string;
    onSuccess?: () => void;
}

export default function RequisitionCreationModal({
    products,
    buttonLabel = "Create Requisition",
    onSuccess
}: Props) {
    const [open, setOpen] = useState(false);
    const dateInput = useRef<HTMLInputElement>(null);

    const defaultItem: RequestItem = {
        product_id: 0,
        required_quantity: '',
        additional_specifications: '',
    };

    // Form initialization with type-safe errors
    const { data, setData, post, errors, processing, reset, clearErrors } = useForm<RequisitionFormData>({
        required_date: '',
        status: '',
        urgency: 'medium',
        requestItems: [{ ...defaultItem }],
    });

    // Reset form when modal opens
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            reset();
            setData({
                required_date: '',
                status: '',
                urgency: 'medium',
                requestItems: [{ ...defaultItem }],
            });
        }
    };

    const handleItemChange = (
        index: number,
        field: string,
        value: string | number
    ) => {
        const updatedItems = [...data.requestItems];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: field === 'product_id' ? Number(value) : value
        };
        setData('requestItems', updatedItems);
    };

    const addNewItem = () => {
        setData('requestItems', [
            ...data.requestItems,
            { ...defaultItem },
        ]);
    };

    const removeItem = (index: number) => {
        if (data.requestItems.length > 1) {
            setData('requestItems', data.requestItems.filter((_, i) => i !== index));
        }
    };

    const submitForApproval: FormEventHandler = (e) => {
        e.preventDefault();
        setData('status', 'submitted');
        submitForm();
    };

    const submitForm = () => {
        post(route('requisitions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
                if (onSuccess) onSuccess();
            },
            onError: () => dateInput.current?.focus(),
        });
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(() => {
            clearErrors();
        }, 100);
    };

    // Helper function to safely get error messages
    const getErrorMessage = (field: string) => {
        return errors[field] || '';
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <Button
                className="bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:ring-indigo-500"
                onClick={() => setOpen(true)}
            >
                {buttonLabel}
            </Button>

            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Create Direct Requisition
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                        onClick={handleClose}
                    >
                    </Button>
                </DialogHeader>

                <div className="py-4">
                    <form>
                        {/* Requisition Details Section */}
                        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-semibold mb-4">Requisition Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Required Date*</label>
                                    <input
                                        type="date"
                                        name="required_date"
                                        ref={dateInput}
                                        value={data.required_date}
                                        onChange={(e) => setData('required_date', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                    {errors.required_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.required_date}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Urgency</label>
                                    <select
                                        name="urgency"
                                        value={data.urgency}
                                        onChange={(e) => setData('urgency', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    {errors.urgency && (
                                        <p className="mt-1 text-sm text-red-600">{errors.urgency}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Request Items Section */}
                        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-semibold mb-4">Request Items</h3>

                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border p-2">#</th>
                                            <th className="border p-2">Required Item*</th>
                                            <th className="border p-2">Required Quantity*</th>
                                            <th className="border p-2">Additional Specifications</th>
                                            <th className="border p-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.requestItems.map((item, index) => (
                                            <tr key={index} className="bg-white border">
                                                <td className="border p-2 text-center">{index + 1}</td>
                                                <td className="border p-2">
                                                    <select
                                                        name="product_id"
                                                        value={item.product_id}
                                                        onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        required
                                                    >
                                                        <option value={0}>Select an item</option>
                                                        {products.map((product) => (
                                                            <option key={product.id} value={product.id}>
                                                                {product.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {getErrorMessage(`requestItems.${index}.product_id`) && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {getErrorMessage(`requestItems.${index}.product_id`)}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="border p-2 w-24">
                                                    <input
                                                        type="number"
                                                        name="required_quantity"
                                                        value={item.required_quantity}
                                                        onChange={(e) => handleItemChange(index, "required_quantity", e.target.value)}
                                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        required
                                                    />
                                                    {getErrorMessage(`requestItems.${index}.required_quantity`) && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {getErrorMessage(`requestItems.${index}.required_quantity`)}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="border p-2">
                                                    <textarea
                                                        name="additional_specifications"
                                                        value={item.additional_specifications}
                                                        onChange={(e) => handleItemChange(index, "additional_specifications", e.target.value)}
                                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-10"
                                                    />
                                                    {getErrorMessage(`requestItems.${index}.additional_specifications`) && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {getErrorMessage(`requestItems.${index}.additional_specifications`)}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="border p-2 text-center">
                                                    {data.requestItems.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-500 flex items-center text-sm mx-auto"
                                                        >
                                                            <Trash2 size={16} className="mr-1" /> Remove
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <button
                                type="button"
                                onClick={addNewItem}
                                className="flex items-center gap-2 text-blue-600 mb-4"
                            >
                                <PlusCircle size={16} /> Add New Item
                            </button>
                        </div>
                    </form>
                </div>

                <DialogFooter className="gap-2 pt-4 border-t border-gray-200">
                    <DialogClose asChild>
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={submitForApproval}
                        disabled={processing}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {processing ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </span>
                        ) : 'Submit for Approval'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}