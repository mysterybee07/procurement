import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PublishEOIModalProps {
    eoiId: number;
}

export default function PublishEOIModal({ eoiId }: PublishEOIModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { data, setData, processing, reset, errors, clearErrors, put } = useForm<{ submission_opening_date: string, eoiId: number }>({
        submission_opening_date: '',
        eoiId: eoiId,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('submission_opening_date', e.target.value);
    };

    const PublishEOI: FormEventHandler = (e) => {
        e.preventDefault();

        put(`/eois/${eoiId}/publish`, {
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
                        <Button className='bg-green-400 text-black'>Publish</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Confirm Publishment</DialogTitle>
                        <DialogDescription>
                           Enter the submission opening date for the vendor to submit their bid.
                        </DialogDescription>
                        <form className="space-y-6" onSubmit={PublishEOI}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Opening Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="submission_opening_date"
                                        value={data.submission_opening_date}
                                        onChange={handleChange}
                                        ref={inputRef}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                {errors.submission_opening_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.submission_opening_date}</p>
                                )}
                            </div>
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={closeModal}>
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button variant="default" type="submit" disabled={processing}>
                                    Publish
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}