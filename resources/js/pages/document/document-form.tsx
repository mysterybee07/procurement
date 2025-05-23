import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import InputError from '@/components/input-error';

interface Document {
  id: number;
  name: string;
}

interface DocumentModalProps {
  isEditing: boolean;
  document?: Document; // Explicitly define the document type as optional
  buttonLabel?: string;
  onSuccess?: (document: Document) => void;
}

export default function DocumentFormModal({ isEditing, document, buttonLabel = "Add New Document", onSuccess }: DocumentModalProps) {
  const nameInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  
  // Initialize the form
  const { data, setData, post, put, errors, processing, reset, clearErrors } = useForm({
    id: '',
    name: '',
  });

  // Update form data when document prop changes or modal opens
  useEffect(() => {
    if (isEditing && document) {
      setData({
        id: document.id.toString(), // Ensure id is a string
        name: document.name || '',
      });
    } else {      
      reset('id', 'name');
    }
  }, [document, isEditing, open]);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    if (isEditing && document?.id) {
      put(route('documents.update', document.id), {
        preserveScroll: true,
        onSuccess: (page) => {
          handleClose();
          if (onSuccess) {
            onSuccess({
              id: document.id,
              name: data.name
            });
          }
        },
        onError: () => nameInput.current?.focus(),
      });
    } else {
      post(route('documents.store'), {
        preserveScroll: true,
        onSuccess: (page) => {
          handleClose();
          if (onSuccess) {
            onSuccess({
              id: page.props.createdDocument?.id || 0,
              name: data.name
            });
          }
        },
        onError: () => nameInput.current?.focus(),
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      clearErrors();
      if (!isEditing) {
        reset();
      }
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:ring-indigo-500"
        >
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Document' : 'Create New Document'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Document Name
              </label>
              <input
                type="text"
                id="name"
                ref={nameInput}
                placeholder="Enter document name"
                className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && <InputError message={errors.name} />}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-gray-200">
            <DialogClose asChild>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </DialogClose>

            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={processing}
            >
              {processing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>{isEditing ? 'Update' : 'Create'} Document</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
