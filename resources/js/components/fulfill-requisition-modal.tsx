import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FulfillRequisitionModalProps {
  requestItemId: number; 
}

export default function FulfillRequisitionModal({ requestItemId }: FulfillRequisitionModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { data, setData, processing, reset, errors, clearErrors, post } = useForm<{ provided_quantity: string, requestItemId: number }>({
      provided_quantity: '',
      requestItemId: requestItemId,
    });

    const fulfillRequisition: FormEventHandler = (e) => {
        e.preventDefault();

        post(`/requisitions/${requestItemId}/fulfill`, {
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
            <div className="space-y-4 rounded-lg borde p-4 dark:border-yellow-200/10 dark:bg-yellow-700/10">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className='bg-green-400 text-black'>Fulfill</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Confirm Fulfillment</DialogTitle>
                        <DialogDescription>
                            Enter the quantity you are providing. The requisition will be marked as fulfilled once the requester acknowledges receipt.
                        </DialogDescription>
                        <form className="space-y-6" onSubmit={fulfillRequisition}>
                            <div className="grid gap-2">
                                <Label htmlFor="provided_quantity">Given Quantity</Label>
                                <Input
                                    id="provided_quantity"
                                    type="number"
                                    name="provided_quantity"
                                    ref={inputRef}
                                    value={data.provided_quantity}
                                    onChange={(e) => setData('provided_quantity', e.target.value)}
                                    placeholder="Enter quantity"
                                    required
                                />
                                <InputError message={errors.provided_quantity} />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={closeModal}>
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button variant="default" type="submit" disabled={processing}>
                                    Fulfill
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
