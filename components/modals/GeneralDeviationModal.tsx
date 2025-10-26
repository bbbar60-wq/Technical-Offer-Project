'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { GeneralDeviation } from '@/types';
import { useAuthStore } from '@/store/authStore';

const deviationSchema = z.object({
  deviation: z.string().min(1, 'Deviation cannot be empty'),
});

type DeviationFormValues = z.infer<typeof deviationSchema>;

interface GeneralDeviationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviation: Omit<GeneralDeviation, 'id'>) => void;
}

export default function GeneralDeviationModal({ isOpen, onClose, onSave }: GeneralDeviationModalProps) {
  const { user } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeviationFormValues>({
    resolver: zodResolver(deviationSchema),
    defaultValues: { deviation: '' },
  });

  const onSubmit = (data: DeviationFormValues) => {
    onSave({
      author: user?.fullName || 'Unknown User',
      date: new Date().toISOString().split('T')[0],
      deviation: data.deviation,
    });
    reset();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add General Deviation">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="deviation" className="block text-sm font-medium dark:text-slate-300">
            Deviation Note
          </label>
          <textarea
            {...register('deviation')}
            rows={4}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
            placeholder="Enter general deviation details..."
          />
          {errors.deviation && <p className="mt-1 text-xs text-danger">{errors.deviation.message}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                Cancel
            </Button>
            <Button type="submit">Save Deviation</Button>
        </div>
      </form>
    </Dialog>
  );
}

