import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ConfirmationModalProps {
    title: string;
    description: string;
    buttonLabel?: string;
    buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary';
    onConfirm?: () => void;
}

export default function Confirmation({ 
    title, 
    description, 
    buttonLabel = "Confirm", 
    buttonVariant = "default", 
    onConfirm 
}: ConfirmationModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={buttonVariant}>{buttonLabel}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button variant={buttonVariant} onClick={onConfirm}>
                            {buttonLabel}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
