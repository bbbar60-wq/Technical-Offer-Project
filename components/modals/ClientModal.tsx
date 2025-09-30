'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Client } from '@/types';
import { useClients } from '@/hooks/useClients';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useEffect } from 'react';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
}

export default function ClientModal({ isOpen, onClose, client }: ClientModalProps) {
  const { addClient, updateClient } = useClients();
  const isEditMode = !!client;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (isOpen) {
        if (client) {
            reset(client);
        } else {
            reset({ name: '', address: '', contactNumber: '' });
        }
    }
  }, [isOpen, client, reset]);


  const onSubmit = (data: ClientFormValues) => {
    if (isEditMode) {
      updateClient({ ...client, ...data });
    } else {
      addClient(data);
    }
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Client' : 'Add New Client'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input {...register('name')} placeholder="Client Name" className="dark:bg-slate-700 dark:border-slate-600" />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <Input {...register('address')} placeholder="Address" className="dark:bg-slate-700 dark:border-slate-600" />
          {errors.address && <p className="mt-1 text-xs text-danger">{errors.address.message}</p>}
        </div>
        <div>
          <Input {...register('contactNumber')} placeholder="Contact Number" className="dark:bg-slate-700 dark:border-slate-600" />
          {errors.contactNumber && <p className="mt-1 text-xs text-danger">{errors.contactNumber.message}</p>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</Button>
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Client'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
