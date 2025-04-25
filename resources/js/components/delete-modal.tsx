import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DeleteModalProps {
    title: string;
    description: string;
    deleteRoute: string;
    itemId?: number | string;
    buttonLabel?: string;
    onSuccess?: () => void;
}

export default function DeleteModal({ title, description, deleteRoute, itemId, buttonLabel = "Delete", onSuccess }: DeleteModalProps) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const { delete: destroy, processing, reset, clearErrors } = useForm();

    const deleteItem: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route(deleteRoute, itemId), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                if (onSuccess) onSuccess();
            },
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">{buttonLabel}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button variant="destructive" disabled={processing} asChild>
                        <button type="submit" onClick={deleteItem}>Delete</button>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
