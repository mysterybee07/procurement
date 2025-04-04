import React, { useState, useRef, FormEventHandler, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';

 const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Approval Workflows',
      href: '/approval-workflows',
    },
    {
      title: 'Create Requisition',
      href: '/approval-workflow/create',
    },
  ];

interface ApprovalStep {
    approver_role: string;
    is_mandatory: boolean;
    step_number: number;
    allow_delegation: boolean;
    step_name: string;
}

interface ApprovalWorkflowFormData {
    workflow_name: string;
    min_amount: string;
    max_amount: string;
    approval_workflow_type: 'sequential' | 'parallel';
    is_active: boolean;
    approvalSteps: ApprovalStep[];
    [key: string]: any;
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    roles: Role[];
    // flash: {
    //     message: string,
    //     error: string,
    // }
    onSuccess?: (workflowId: number) => void;
}

export default function ApprovalWorkflowPage({ roles, onSuccess }: Props) {
    const nameInput = useRef<HTMLInputElement>(null);
    const [initialized, setInitialized] = useState(false);

    const defaultStep: ApprovalStep = {
        approver_role: '',
        is_mandatory: true,
        step_number: 1,
        allow_delegation: false,
        step_name: '',
    };

    // Form initialization with type-safe errors
    const { data, setData, post, errors, processing, reset, clearErrors } = useForm<ApprovalWorkflowFormData>({
        workflow_name: '',
        min_amount: '',
        max_amount: '',
        approval_workflow_type: 'sequential',
        is_active: true,
        approvalSteps: [{ ...defaultStep }],
    });

    useEffect(() => {
        // Initialize the form when component mounts
        reset();
        setData({
            workflow_name: '',
            min_amount: '',
            max_amount: '',
            approval_workflow_type: 'sequential',
            is_active: true,
            approvalSteps: [{ ...defaultStep }],
        });
        setInitialized(true);

        // Focus on name input when component mounts
        if (nameInput.current) {
            nameInput.current.focus();
        }
    }, []);

    // Update step numbers when steps are added or removed
    useEffect(() => {
        if (initialized) {
            const updatedSteps = data.approvalSteps.map((step, index) => ({
                ...step,
                step_number: index + 1
            }));
            setData('approvalSteps', updatedSteps);
        }
    }, [initialized, data.approvalSteps.length]);

    const handleStepChange = (
        index: number,
        field: string,
        value: string | number | boolean
    ) => {
        const updatedSteps = [...data.approvalSteps];
        updatedSteps[index] = {
            ...updatedSteps[index],
            [field]: value
        };
        setData('approvalSteps', updatedSteps);
    };

    const addNewStep = () => {
        const newStepNumber = data.approvalSteps.length + 1;
        setData('approvalSteps', [
            ...data.approvalSteps,
            {
                ...defaultStep,
                step_number: newStepNumber
            },
        ]);
    };

    const removeStep = (index: number) => {
        if (data.approvalSteps.length <= 1) return;

        setData('approvalSteps', data.approvalSteps.filter((_, i) => i !== index));
    };

    const submitForm: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('approval-workflows.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                resetForm();
                const workflow = page.props.workflow as { id: number } | undefined;

                if (workflow && workflow.id) {
                    console.log(`New approval workflow created with ID: ${workflow.id}`);

                    if (onSuccess) {
                        onSuccess(workflow.id);
                    }
                } else {
                    console.error("Couldn't get workflow ID from response");
                }
            },
            onError: () => nameInput.current?.focus(),
        });
    };

    const resetForm = () => {
        clearErrors();

        // Reset form data
        reset();
        setData({
            workflow_name: '',
            min_amount: '',
            max_amount: '',
            approval_workflow_type: 'sequential',
            is_active: true,
            approvalSteps: [{ ...defaultStep }],
        });
    };

    // Helper function to safely get error messages
    const getErrorMessage = (field: string) => {
        return errors[field] || '';
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        // header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Product Categories</h2>}
        >
            <Head title="Documents" />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Message
                    {flash.message && (
                        <div className="mb-4 text-green-600 bg-green-100 border border-green-400 px-4 py-2 rounded-md">
                            {flash.message}
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-4 text-red-600 bg-red-100 border border-red-400 px-4 py-2 rounded-md">
                            {flash.error}
                        </div>
                    )} */}

                    <div className="container mx-auto py-4">
                        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h1 className="text-2xl font-bold text-gray-800">Create Approval Workflow</h1>
                                <p className="text-gray-600 mt-1">Set up a new approval workflow with customized steps</p>
                            </div>

                            <div className="p-6">
                                <form onSubmit={submitForm}>
                                    {/* Workflow Details Section */}
                                    <div className="mb-8 p-6 border rounded-lg bg-gray-50">
                                        <h3 className="text-lg font-semibold mb-4">Workflow Details</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Workflow Name*</label>
                                                <input
                                                    type="text"
                                                    name="workflow_name"
                                                    ref={nameInput}
                                                    value={data.workflow_name}
                                                    onChange={(e) => setData('workflow_name', e.target.value)}
                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    required
                                                />
                                                {errors.workflow_name && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.workflow_name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Workflow Type</label>
                                                <select
                                                    name="approval_workflow_type"
                                                    value={data.approval_workflow_type}
                                                    onChange={(e) => setData('approval_workflow_type', e.target.value as 'sequential' | 'parallel')}
                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                >
                                                    <option value="sequential">Sequential</option>
                                                    <option value="parallel">Parallel</option>
                                                </select>
                                                {errors.approval_workflow_type && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.approval_workflow_type}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Minimum Amount</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="min_amount"
                                                    value={data.min_amount}
                                                    onChange={(e) => setData('min_amount', e.target.value)}
                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                {errors.min_amount && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.min_amount}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Maximum Amount</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="max_amount"
                                                    value={data.max_amount}
                                                    onChange={(e) => setData('max_amount', e.target.value)}
                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                {errors.max_amount && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.max_amount}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="is_active"
                                                    name="is_active"
                                                    checked={data.is_active}
                                                    onChange={(e) => setData('is_active', e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="is_active" className="ml-2 block text-sm">
                                                    Active Workflow
                                                </label>
                                                {errors.is_active && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.is_active}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Approval Steps Section */}
                                    <div className="mb-8 p-6 border rounded-lg bg-gray-50">
                                        <h3 className="text-lg font-semibold mb-4">Approval Steps</h3>

                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border-collapse border border-gray-200">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border p-2">Step Number</th>
                                                        <th className="border p-2">Step Name*</th>
                                                        <th className="border p-2">Approver Role*</th>
                                                        <th className="border p-2">Mandatory</th>
                                                        <th className="border p-2">Allow Delegation</th>
                                                        <th className="border p-2">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.approvalSteps.map((step, index) => (
                                                        <tr key={index} className="bg-white border">
                                                            <td className="border p-2 text-center">{step.step_number}</td>
                                                            <td className="border p-2">
                                                                <input
                                                                    type="text"
                                                                    name="step_name"
                                                                    value={step.step_name}
                                                                    onChange={(e) => handleStepChange(index, "step_name", e.target.value)}
                                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                    required
                                                                />
                                                                {getErrorMessage(`approvalSteps.${index}.step_name`) && (
                                                                    <p className="mt-1 text-sm text-red-600">
                                                                        {getErrorMessage(`approvalSteps.${index}.step_name`)}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="border p-2">
                                                                <select
                                                                    name="approver_role"
                                                                    value={step.approver_role}
                                                                    onChange={(e) => handleStepChange(index, "approver_role", e.target.value)}
                                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                    required
                                                                >
                                                                    <option value="">Select a role</option>
                                                                    {roles.map((role) => (
                                                                        <option key={role.id} value={role.name}>
                                                                            {role.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {getErrorMessage(`approvalSteps.${index}.approver_role`) && (
                                                                    <p className="mt-1 text-sm text-red-600">
                                                                        {getErrorMessage(`approvalSteps.${index}.approver_role`)}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="border p-2 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={step.is_mandatory}
                                                                    onChange={(e) => handleStepChange(index, "is_mandatory", e.target.checked)}
                                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                />
                                                                {getErrorMessage(`approvalSteps.${index}.is_mandatory`) && (
                                                                    <p className="mt-1 text-sm text-red-600">
                                                                        {getErrorMessage(`approvalSteps.${index}.is_mandatory`)}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="border p-2 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={step.allow_delegation}
                                                                    onChange={(e) => handleStepChange(index, "allow_delegation", e.target.checked)}
                                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                />
                                                                {getErrorMessage(`approvalSteps.${index}.allow_delegation`) && (
                                                                    <p className="mt-1 text-sm text-red-600">
                                                                        {getErrorMessage(`approvalSteps.${index}.allow_delegation`)}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="border p-2 text-center">
                                                                {data.approvalSteps.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeStep(index)}
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
                                            onClick={addNewStep}
                                            className="flex items-center gap-2 text-blue-600 mt-4"
                                        >
                                            <PlusCircle size={16} /> Add Approval Step
                                        </button>
                                    </div>

                                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetForm}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            {processing ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Creating...
                                                </span>
                                            ) : 'Create Workflow'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}