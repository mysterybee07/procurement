import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ReceiveRequisitionModalProps {
    requestItemId: number;
}

export default function ReceiveRequisitionModal({ requestItemId }: ReceiveRequisitionModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { data, setData, processing, reset, errors, clearErrors, post } = useForm<{ requestItemId: number }>({
        requestItemId: requestItemId,
    });

    const fulfillRequisition: FormEventHandler = (e) => {
        e.preventDefault();

        post(`/requisitions/${requestItemId}/receive`, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => inputRef.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4 dark:border-yellow-200/10 dark:bg-yellow-700/10">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-green-400 text-black">Receive</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Confirm Item Received</DialogTitle>
                        <DialogDescription>
                            Are you sure you have received the items you requested?
                        </DialogDescription>
                        <form onSubmit={fulfillRequisition}>
                            <DialogFooter className="mt-4">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" onClick={closeModal}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="bg-green-500 text-white" disabled={processing}>
                                    {processing ? 'Processing...' : 'Confirm'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
