'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Client } from '@/types';
import { useClients } from '@/hooks/useClients';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { UploadCloud } from 'lucide-react';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  logoFile: z.instanceof(File).optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
}

// Helper function to format the image path for next/image
const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('blob:') || path.startsWith('http')) {
    return path;
  }
  return `/${path}`;
};

export default function ClientModal({ isOpen, onClose, client }: ClientModalProps) {
  const { addClient, updateClient } = useClients();
  const isEditMode = !!client;

  const [previewUrl, setPreviewUrl] = useState<string | null>(getImageUrl(client?.logo));

  const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', address: '', contactNumber: '', logoFile: undefined }
  });

  const logoFile = watch('logoFile');

  // Generate preview URL when file changes
  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (client?.logo) {
      setPreviewUrl(getImageUrl(client.logo));
    } else {
      setPreviewUrl(null);
    }
  }, [logoFile, client?.logo]);

  useEffect(() => {
    if (isOpen) {
        if (client) {
            reset({
              name: client.name,
              address: client.address,
              contactNumber: client.contactNumber,
              logoFile: undefined
            });
            setPreviewUrl(getImageUrl(client.logo));
        } else {
            reset({ name: '', address: '', contactNumber: '', logoFile: undefined });
            setPreviewUrl(null);
        }
    }
  }, [isOpen, client, reset]);

  const onSubmit = (data: ClientFormValues) => {
    const logoPath = data.logoFile ? data.logoFile.name : (client?.logo || '');

    const clientData = {
        name: data.name,
        address: data.address,
        contactNumber: data.contactNumber,
        logo: logoPath
    };

    if (isEditMode && client) {
      updateClient({ ...client, ...clientData });
    } else {
      addClient(clientData);
    }
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Client' : 'Add New Client'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Logo Upload */}
        <div>
            <label className="block text-sm font-medium dark:text-slate-300 mb-1">Logo</label>
            <div className="flex items-center gap-4">
                 {/* Preview or Placeholder */}
                <div className="w-24 h-24 rounded border flex items-center justify-center bg-muted dark:bg-slate-700 dark:border-slate-600 overflow-hidden">
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="Preview"
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                            onError={() => setPreviewUrl(null)}
                        />
                    ) : (
                        <UploadCloud className="w-8 h-8 text-neutral-400 dark:text-slate-500" />
                    )}
                </div>
                {/* File Input */}
                <Controller
                    name="logoFile"
                    control={control}
                    render={({ field: { onChange, onBlur, name, ref } }) => (
                         <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                            onBlur={onBlur}
                            name={name}
                            ref={ref}
                            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-slate-600 dark:file:text-slate-300 dark:hover:file:bg-slate-500"
                        />
                    )}
                />
            </div>
            {errors.logoFile && <p className="mt-1 text-xs text-danger">{errors.logoFile.message}</p>}
        </div>

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium dark:text-slate-300">
            Name<span className="text-danger">*</span>
          </label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Client Name"
            className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>

        {/* Address Input */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium dark:text-slate-300">
            Address<span className="text-danger">*</span>
          </label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Address"
            className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
          />
          {errors.address && <p className="mt-1 text-xs text-danger">{errors.address.message}</p>}
        </div>

        {/* Contact Number Input */}
        <div>
          <label htmlFor="contactNumber" className="block text-sm font-medium dark:text-slate-300">
            Contact Number<span className="text-danger">*</span>
          </label>
          <Input
            id="contactNumber"
            {...register('contactNumber')}
            placeholder="Contact Number"
            className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
          />
          {errors.contactNumber && <p className="mt-1 text-xs text-danger">{errors.contactNumber.message}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-600">
            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</Button>
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Client'}</Button>
        </div>
      </form>
    </Dialog>
  );
}