'use client';

import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, description }: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-4">
            <h3 className="text-lg font-semibold leading-6 text-neutral-900 dark:text-slate-50">{title}</h3>
            <div className="mt-2">
                <p className="text-sm text-neutral-600 dark:text-slate-300">{description}</p>
            </div>
        </div>
        <div className="mt-5 sm:mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
            Cancel
          </Button>
          <Button type="button" className="bg-danger hover:bg-red-700" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

