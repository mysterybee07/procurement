import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface RejectModalProps {
    entityId: number;
}

export default function RejectModal({ entityId }: RejectModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { data, setData, processing, reset, errors, clearErrors, put } = useForm<{ comments: string }>({
        comments: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('comments', e.target.value);
    };

    const rejectEntity: FormEventHandler = (e) => {
        e.preventDefault();

        // Validate that comments are provided for rejection
        if (!data.comments.trim()) {
            setData('errors', { comments: 'Comments are required for rejection' });
            inputRef.current?.focus();
            return;
        }

        put(`/entity/${entityId}/reject`, {
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
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm font-medium flex items-center"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Reject
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Confirm Rejection</DialogTitle>
                <DialogDescription>
                    Please provide a reason for rejecting this EOI. This information will be shared with the requester.
                </DialogDescription>
                <form className="space-y-6" onSubmit={rejectEntity}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Reason for rejection*</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="comments"
                                value={data.comments}
                                onChange={handleChange}
                                ref={inputRef}
                                className="w-full p-2 border rounded"
                                placeholder="Enter rejection reason (required)"
                                maxLength={500}
                                required
                            />
                        </div>
                        {errors.comments && (
                            <p className="mt-1 text-sm text-red-600">{errors.comments}</p>
                        )}
                    </div>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={closeModal}>
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button 
                            variant="default" 
                            type="submit" 
                            className="bg-red-600 hover:bg-red-700" 
                            disabled={processing || !data.comments.trim()}
                        >
                            {processing ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}