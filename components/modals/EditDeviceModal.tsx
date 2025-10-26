'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Device, Deviation, newId, Accessory } from '@/types';
import { Trash2, Check } from 'lucide-react';
import { Tab } from '@headlessui/react';
import { cn } from '@/lib/utils';
import { getAccessories } from '@/lib/api';
import { useProducts } from '@/hooks/useProducts';

const detailsSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  model: z.string().min(1, 'Model is required'),
  brand: z.string().min(1, 'Brand is required'),
  qtyMain: z.coerce.number().min(0, 'Qty must be 0 or more').default(0),
  qtySpare: z.coerce.number().min(0, 'Qty must be 0 or more').default(0),
});

const deviationSchema = z.object({
  clientRequest: z.string().min(1, 'Client request is required'),
  vendorReply: z.string().min(1, 'Vendor reply is required'),
});

type DetailsFormValues = z.infer<typeof detailsSchema>;
type DeviationFormValues = z.infer<typeof deviationSchema>;

interface EditDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
  onSave: (updatedDevice: Device) => void;
}

export default function EditDeviceModal({ isOpen, onClose, device, onSave }: EditDeviceModalProps) {
  const { products: allProducts } = useProducts();
  const [allAccessories, setAllAccessories] = useState<Accessory[]>([]);
  const [currentDeviations, setCurrentDeviations] = useState<Deviation[]>([]);
  const [currentAccessories, setCurrentAccessories] = useState<Accessory[]>([]);
  const [productOptions, setProductOptions] = useState<{ value: string; label: string }[]>([]);

  const {
    control: detailsControl,
    handleSubmit: handleDetailsSubmit,
    reset: resetDetails,
    formState: { errors: detailsErrors },
    setValue
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      name: '',
      model: '',
      brand: '',
      qtyMain: 0,
      qtySpare: 0
    }
  });

  const {
    register: deviationRegister,
    handleSubmit: handleDeviationSubmit,
    reset: resetDeviation,
    formState: { errors: deviationErrors }
  } = useForm<DeviationFormValues>({
    resolver: zodResolver(deviationSchema),
    defaultValues: { clientRequest: '', vendorReply: '' }
  });

  useEffect(() => {
    getAccessories().then(setAllAccessories);
  }, []);

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      const options = allProducts.map(product => ({
        value: product.id,
        label: `${product.Name} - ${product.Model} (${product.Brand})`
      }));
      setProductOptions(options);
    }
  }, [allProducts]);

  useEffect(() => {
    if (device && isOpen) {
      resetDetails({
        name: device.name || '',
        model: device.model || '',
        brand: device.brand || '',
        qtyMain: device.qtyMain ?? 0,
        qtySpare: device.qtySpare ?? 0,
      });
      setCurrentDeviations(device.deviations || []);
      setCurrentAccessories(device.accessories || []);
      resetDeviation();
    } else if (!isOpen) {
      resetDetails({
        name: '',
        model: '',
        brand: '',
        qtyMain: 0,
        qtySpare: 0,
      });
      setCurrentDeviations([]);
      setCurrentAccessories([]);
      resetDeviation();
    }
  }, [device, isOpen, resetDetails, resetDeviation]);

  const handleAddDeviation = (data: DeviationFormValues) => {
    const newDeviation: Deviation = { ...data, id: newId() };
    setCurrentDeviations(prev => [...prev, newDeviation]);
    resetDeviation();
  };

  const handleRemoveDeviation = (id: string) => {
    setCurrentDeviations(prev => prev.filter(d => d.id !== id));
  };

  const handleToggleAccessory = (acc: Accessory) => {
    setCurrentAccessories(prev => {
      const isAdded = prev.some(a => a.id === acc.id);
      if (isAdded) {
        return prev.filter(a => a.id !== acc.id);
      } else {
        return [...prev, { ...acc, qty: 1 }];
      }
    });
  };

  const handleProductChange = (productId: string) => {
    const selectedProduct = allProducts?.find(p => p.id === productId);
    if (selectedProduct) {
      setValue('name', selectedProduct.Name || '');
      setValue('model', selectedProduct.Model || '');
      setValue('brand', selectedProduct.Brand || '');
    }
  };

  const handleSaveChanges = (detailsData: DetailsFormValues) => {
    if (!device) return;

    const updatedDevice: Device = {
      ...device,
      name: detailsData.name,
      model: detailsData.model,
      brand: detailsData.brand,
      qtyMain: detailsData.qtyMain,
      qtySpare: detailsData.qtySpare,
      deviations: currentDeviations,
      accessories: currentAccessories,
      productDetails: {
        ...device.productDetails,
        Name: detailsData.name,
        Model: detailsData.model,
        Brand: detailsData.brand,
      }
    };
    onSave(updatedDevice);
    onClose();
  };

  const TABS = ['Details', 'Deviations', 'Accessories'];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Edit: ${device?.name || 'Device'}`} size="xl">
      <div className="w-full max-w-4xl">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-lg bg-primary/10 dark:bg-primary/20 p-1">
            {TABS.map((tabName) => (
              <Tab
                key={tabName}
                className={({ selected }) =>
                  cn(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors',
                    'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 dark:ring-offset-slate-800 ring-white ring-opacity-60',
                    selected
                      ? 'bg-white dark:bg-slate-300 text-primary shadow'
                      : 'text-neutral-600 dark:text-blue-100 hover:bg-white/[0.6] dark:hover:bg-white/[0.12] hover:text-primary dark:hover:text-white'
                  )
                }
              >
                {tabName}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel className="rounded-xl bg-transparent p-3 focus:outline-none">
              <form onSubmit={handleDetailsSubmit(handleSaveChanges)} className="space-y-4">
                <h4 className="font-semibold text-neutral-800 dark:text-slate-100 mb-2">Device Details</h4>

                <div>
                  <label className="text-sm font-medium dark:text-slate-300">Select Product</label>
                  <Select
                    options={productOptions}
                    onChange={(e) => handleProductChange(e.target.value)}
                    placeholder="Select a product..."
                    className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium dark:text-slate-300">Product Name</label>
                    <Controller
                      name="name"
                      control={detailsControl}
                      render={({ field }) => (
                        <Input {...field} className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50" />
                      )}
                    />
                    {detailsErrors.name && <p className="mt-1 text-xs text-danger">{detailsErrors.name.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium dark:text-slate-300">Model</label>
                    <Controller
                      name="model"
                      control={detailsControl}
                      render={({ field }) => (
                        <Input {...field} className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50" />
                      )}
                    />
                    {detailsErrors.model && <p className="mt-1 text-xs text-danger">{detailsErrors.model.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium dark:text-slate-300">Brand</label>
                    <Controller
                      name="brand"
                      control={detailsControl}
                      render={({ field }) => (
                        <Input {...field} className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50" />
                      )}
                    />
                    {detailsErrors.brand && <p className="mt-1 text-xs text-danger">{detailsErrors.brand.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium dark:text-slate-300">Qty: Main</label>
                    <Controller
                      name="qtyMain"
                      control={detailsControl}
                      render={({ field }) => (
                        <Input {...field} type="number" min="0" className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50" />
                      )}
                    />
                    {detailsErrors.qtyMain && <p className="mt-1 text-xs text-danger">{detailsErrors.qtyMain.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium dark:text-slate-300">Qty: Spare</label>
                    <Controller
                      name="qtySpare"
                      control={detailsControl}
                      render={({ field }) => (
                        <Input {...field} type="number" min="0" className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50" />
                      )}
                    />
                    {detailsErrors.qtySpare && <p className="mt-1 text-xs text-danger">{detailsErrors.qtySpare.message}</p>}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-600">
                  <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Tab.Panel>

            <Tab.Panel className="rounded-xl bg-transparent p-3 focus:outline-none">
              <h4 className="font-semibold text-neutral-800 dark:text-slate-100 mb-2">Current Deviations</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto p-2 border rounded-md bg-muted dark:bg-slate-800 dark:border-slate-600 mb-4">
                {currentDeviations.length > 0 ? currentDeviations.map((dev, index) => (
                  <div key={dev.id} className="text-sm p-2 bg-surface rounded dark:bg-slate-700">
                    <div className="flex justify-between items-start">
                      <p className="dark:text-slate-300"><strong>{index + 1}. Client:</strong> {dev.clientRequest}</p>
                      <Button type="button" variant="ghost" size="icon" className="h-5 w-5 text-danger flex-shrink-0" onClick={() => handleRemoveDeviation(dev.id)}>
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </div>
                    <p className="dark:text-slate-300"><strong>Vendor:</strong> {dev.vendorReply}</p>
                  </div>
                )) : <p className="text-sm text-neutral-500 text-center py-4 dark:text-slate-400">No deviations added.</p>}
              </div>

              <form onSubmit={handleDeviationSubmit(handleAddDeviation)} className="space-y-3 p-3 border rounded-md dark:border-slate-600">
                <h5 className="font-medium text-sm dark:text-slate-100">Add New Deviation</h5>
                <div>
                  <label className="sr-only">Client Request</label>
                  <textarea {...deviationRegister('clientRequest')} placeholder="Client Request..." rows={2} className="w-full text-sm p-2 border rounded-md dark:bg-slate-800 dark:border-slate-600 dark:text-slate-50" />
                  {deviationErrors.clientRequest && <p className="mt-1 text-xs text-danger">{deviationErrors.clientRequest.message}</p>}
                </div>
                <div>
                  <label className="sr-only">Vendor Reply</label>
                  <textarea {...deviationRegister('vendorReply')} placeholder="Vendor Reply..." rows={2} className="w-full text-sm p-2 border rounded-md dark:bg-slate-800 dark:border-slate-600 dark:text-slate-50" />
                  {deviationErrors.vendorReply && <p className="mt-1 text-xs text-danger">{deviationErrors.vendorReply.message}</p>}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm">Add Deviation</Button>
                </div>
              </form>
            </Tab.Panel>

            <Tab.Panel className="rounded-xl bg-transparent p-3 focus:outline-none">
              <h4 className="font-semibold text-neutral-800 dark:text-slate-100 mb-2">Available Accessories</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto p-2 border rounded-md bg-muted dark:bg-slate-800 dark:border-slate-600">
                {allAccessories.length === 0 && <p className="text-sm text-neutral-500 dark:text-slate-400 text-center py-4">Loading accessories...</p>}
                {allAccessories.map(acc => {
                  const isAdded = currentAccessories.some(a => a.id === acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleToggleAccessory(acc)}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                        isAdded ? 'bg-primary/20 dark:bg-primary/30' : 'bg-surface dark:bg-slate-700 hover:bg-muted dark:hover:bg-slate-600'
                      )}
                    >
                      <div className="dark:text-slate-100">
                        <p className="font-medium">{acc.name}</p>
                        <p className="text-xs text-neutral-600 dark:text-slate-400">{acc.partNo}</p>
                      </div>
                      {isAdded && <Check className="h-5 w-5 text-primary" />}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-600 mt-4">
                <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                  Cancel
                </Button>
                <Button type="button" onClick={handleDetailsSubmit(handleSaveChanges)}>
                  Save Changes
                </Button>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Dialog>
  );
}