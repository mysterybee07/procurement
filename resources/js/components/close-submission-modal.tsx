import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CloseEOIModalProps {
    eoiId: number;
}

export default function CloseEOIModal({ eoiId }: CloseEOIModalProps) {
    const { processing, reset, clearErrors, put } = useForm<{ eoiId: number }>({
        eoiId: eoiId,
    });

    const closeEOI: FormEventHandler = (e) => {
        e.preventDefault();

        put(`/eois/${eoiId}/close`, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
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
                        <Button className="bg-red-400 text-black">Close EOI Submission</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Confirm Close</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to close this EOI for submission? This action will prevent vendors from submitting any further bids.
                        </DialogDescription>
                        <form className="space-y-6" onSubmit={closeEOI}>
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={closeModal}>
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button variant="destructive" type="submit" disabled={processing}>
                                    Close Submission
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}