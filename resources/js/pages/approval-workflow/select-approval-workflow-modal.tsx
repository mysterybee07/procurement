import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface SelectWorkflowModalProps {
    approval_workflows: {
        id: number; 
        name: string 
    }[];
    entity_id: number;
}

export default function SelectWorkflowModal({ approval_workflows, entity_id }: SelectWorkflowModalProps) {
    const selectRef = useRef<HTMLSelectElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        approval_workflow_id: string;
        entity_type: string;
        entity_id: number;
    }>({
        approval_workflow_id: '',
        entity_type: '', 
        entity_id: 0,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post(`/requests/${entity_id}/set-workflow`, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => selectRef.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4 rounded-lg p-4 dark:border-yellow-200/10 dark:bg-yellow-700/10">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-500 text-white">Set Approval Workflow</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Assign Approval Workflow</DialogTitle>
                        <DialogDescription>
                            Select an existing workflow or create a new one if needed.
                        </DialogDescription>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid gap-2">
                                <Label htmlFor="workflow">Select Workflow</Label>
                                <Select
                                    value={data.approval_workflow_id}
                                    onValueChange={(value) => setData('approval_workflow_id', value)}
                                >
                                    <SelectTrigger id="workflow">
                                        <SelectValue placeholder="Choose workflow" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {approval_workflows.map((workflow) => (
                                            <SelectItem key={workflow.id} value={workflow.id.toString()}>
                                                {workflow.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.approval_workflow_id} />
                            </div>

                            <Button>
                                <a
                                    href="/approval-workflow/create"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    + Create New Workflow
                                </a>
                            </Button>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={closeModal}>
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button type="submit" disabled={processing}>
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
