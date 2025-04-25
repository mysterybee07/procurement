import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BeginSelectionModalProps {
    eoiId: number;
}

export default function BeginSelectionModal({ eoiId }: BeginSelectionModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { data, setData, processing, reset, errors, clearErrors, post } = useForm<{ eoiId: number }>({
        eoiId: eoiId,
    });

    const VendorSelection: FormEventHandler = (e) => {
        e.preventDefault();

        post(`/eoi-submission/${eoiId}/begin-selection`, {
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
                        <Button className="bg-green-400 text-black">Begin Vendor Selection</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Confirm Document Acceptance</DialogTitle>
                        <DialogDescription>
                            Are you sure you have gone through the document vendor provide? Make sure to accept the documents.
                        </DialogDescription>
                        <form onSubmit={VendorSelection}>
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
