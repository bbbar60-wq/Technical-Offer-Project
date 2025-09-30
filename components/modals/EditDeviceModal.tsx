'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Device, Deviation, newId } from '@/types';
import { Trash2 } from 'lucide-react';

const deviationSchema = z.object({
  clientRequest: z.string().min(1, 'Client request is required'),
  vendorReply: z.string().min(1, 'Vendor reply is required'),
});

type DeviationFormValues = z.infer<typeof deviationSchema>;

interface EditDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
  onSave: (updatedDevice: Device) => void;
}

export default function EditDeviceModal({ isOpen, onClose, device, onSave }: EditDeviceModalProps) {
  const [deviations, setDeviations] = useState<Deviation[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeviationFormValues>({
    resolver: zodResolver(deviationSchema),
  });

  useEffect(() => {
    if (device) {
      setDeviations(device.deviations || []);
    } else {
      setDeviations([]);
    }
    reset({ clientRequest: '', vendorReply: '' });
  }, [device, isOpen, reset]);

  if (!device) return null;

  const handleAddDeviation = (data: DeviationFormValues) => {
    const newDeviation: Deviation = { ...data, id: newId() };
    setDeviations([...deviations, newDeviation]);
    reset();
  };

  const handleRemoveDeviation = (id: string) => {
    setDeviations(deviations.filter(d => d.id !== id));
  };

  const handleSaveChanges = () => {
    const updatedDevice: Device = { ...device, deviations };
    onSave(updatedDevice);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Edit: ${device.name}`}>
      <div className="space-y-6">
        {/* Deviation Section */}
        <div>
          <h4 className="font-semibold text-neutral-800 mb-2 dark:text-slate-100">Deviations</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto p-2 border rounded-md bg-muted dark:bg-slate-800/50 dark:border-slate-700">
            {deviations.length > 0 ? deviations.map((dev, index) => (
              <div key={dev.id} className="text-sm p-2 bg-surface rounded dark:bg-slate-700">
                <div className="flex justify-between items-start">
                    <p><strong>{index + 1}. Client:</strong> {dev.clientRequest}</p>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-danger" onClick={() => handleRemoveDeviation(dev.id)}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
                <p><strong>Vendor:</strong> {dev.vendorReply}</p>
              </div>
            )) : <p className="text-sm text-neutral-500 text-center py-4 dark:text-slate-400">No deviations added.</p>}
          </div>
        </div>

        {/* Add Deviation Form */}
        <form onSubmit={handleSubmit(handleAddDeviation)} className="space-y-3 p-3 border rounded-md dark:border-slate-700">
            <h5 className="font-medium text-sm dark:text-slate-200">Add New Deviation</h5>
            <div>
                <textarea {...register('clientRequest')} placeholder="Client Request..." rows={2} className="w-full text-sm p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                {errors.clientRequest && <p className="mt-1 text-xs text-danger">{errors.clientRequest.message}</p>}
            </div>
            <div>
                <textarea {...register('vendorReply')} placeholder="Vendor Reply..." rows={2} className="w-full text-sm p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                {errors.vendorReply && <p className="mt-1 text-xs text-danger">{errors.vendorReply.message}</p>}
            </div>
            <div className="flex justify-end">
                <Button type="submit" size="sm">Add Deviation</Button>
            </div>
        </form>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-700">
          <Button type="button" variant="outline" onClick={onClose} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</Button>
          <Button type="button" onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </div>
    </Dialog>
  );
}
