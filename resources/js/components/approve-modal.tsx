import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ApproveModalProps {
    entityId: number;
}

export default function ApproveModal({ entityId }: ApproveModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { data, setData, processing, reset, errors, clearErrors, put } = useForm<{ comments: string }>({
        comments: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('comments', e.target.value);
    };

    const ApproveEntity: FormEventHandler = (e) => {
        e.preventDefault();

        put(`/entity/${entityId}/approve`, {
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
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium flex items-center"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Approve
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Confirm Approve</DialogTitle>
                <DialogDescription>
                    Are you sure you have gone through the EOI details. Enter your comments (optional):
                </DialogDescription>
                <form className="space-y-6" onSubmit={ApproveEntity}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Comments</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="comments"
                                value={data.comments}
                                onChange={handleChange}
                                ref={inputRef}
                                className="w-full p-2 border rounded"
                                placeholder="Optional comments (max 500 characters)"
                                maxLength={500}
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

                        <Button variant="default" type="submit" className="bg-green-600 hover:bg-green-700" disabled={processing}>
                            Approve
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}