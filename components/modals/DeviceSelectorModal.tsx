'use client';

import { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Product, Device } from '@/types';
import { useProducts } from '@/hooks/useProducts';

interface DeviceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDevices: (devices: Device[]) => void;
}

type Selection = Record<string, { product: Product; qtyMain: number; qtySpare: number }>;

export default function DeviceSelectorModal({ isOpen, onClose, onAddDevices }: DeviceSelectorModalProps) {
  const { products, isLoading } = useProducts();

  // State for filters
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // State for selected devices
  const [selection, setSelection] = useState<Selection>({});

  const filteredProducts = useMemo(() => {
    return (products || []).filter(p =>
      (p.Name || '').toLowerCase().includes(nameFilter.toLowerCase()) &&
      (p.Category || '').toLowerCase().includes(categoryFilter.toLowerCase()) &&
      (p.Brand || '').toLowerCase().includes(brandFilter.toLowerCase())
    );
  }, [products, nameFilter, categoryFilter, brandFilter]);

  const handleSelectionChange = (product: Product, isSelected: boolean) => {
    setSelection(prev => {
        const newSelection = { ...prev };
        if (isSelected) {
            newSelection[product.id] = { product, qtyMain: 1, qtySpare: 0 };
        } else {
            delete newSelection[product.id];
        }
        return newSelection;
    });
  };

  const handleQtyChange = (product: Product, qtyType: 'qtyMain' | 'qtySpare', qty: number) => {
    if (qty >= 0) {
        setSelection(prev => ({
            ...prev,
            [product.id]: {
              ...prev[product.id],
              [qtyType]: qty
            }
        }));
    }
  };

  const handleAddClick = () => {
    const devicesToAdd: Device[] = Object.values(selection).map(({ product, qtyMain, qtySpare }) => ({
      id: product.id,
      name: product.Name || '',
      model: product.Model || '',
      brand: product.Brand || '',
      qtyMain: qtyMain,
      qtySpare: qtySpare,
      productDetails: product, // Ensure this is always included
      deviations: [],
      accessories: [],
    }));
    onAddDevices(devicesToAdd);
    setSelection({});
    onClose();
  };

  const columns: ColumnDef<Product>[] = [
    {
      id: 'select',
      header: 'Select',
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={!!selection[row.original.id]}
          onChange={(e) => handleSelectionChange(row.original, e.target.checked)}
          className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary"
        />
      ),
    },
    { accessorKey: 'Name', header: 'Name', size: 200 },
    { accessorKey: 'Category', header: 'Category', size: 150 },
    { accessorKey: 'Brand', header: 'Brand', size: 150 },
    { accessorKey: 'Model', header: 'Model', size: 150 },
    {
        id: 'qtyMain',
        header: 'Qty: Main',
        cell: ({ row }) => (
            <Input
                type="number"
                min="0"
                className="h-8 w-20 dark:text-slate-50 dark:bg-slate-700"
                value={selection[row.original.id]?.qtyMain ?? ''}
                onChange={e => handleQtyChange(row.original, 'qtyMain', parseInt(e.target.value, 10) || 0)}
                disabled={!selection[row.original.id]}
                placeholder="-"
            />
        )
    },
    {
        id: 'qtySpare',
        header: 'Qty: Spare',
        cell: ({ row }) => (
            <Input
                type="number"
                min="0"
                className="h-8 w-20 dark:text-slate-50 dark:bg-slate-700"
                value={selection[row.original.id]?.qtySpare ?? ''}
                onChange={e => handleQtyChange(row.original, 'qtySpare', parseInt(e.target.value, 10) || 0)}
                disabled={!selection[row.original.id]}
                placeholder="-"
            />
        )
    }
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Select Devices" size="4xl">
        <div className="w-full h-[80vh] flex flex-col">
            {/* Filter Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-1">
                <div>
                    <label className="text-sm dark:text-slate-300">Product Name</label>
                    <Input
                      value={nameFilter}
                      onChange={e => setNameFilter(e.target.value)}
                      placeholder="e.g., Transmitter"
                      className="mt-1 dark:text-slate-50 dark:bg-slate-700 dark:border-slate-600"
                    />
                </div>
                 <div>
                    <label className="text-sm dark:text-slate-300">Category</label>
                    <Input
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      placeholder="e.g., Valves"
                      className="mt-1 dark:text-slate-50 dark:bg-slate-700 dark:border-slate-600"
                    />
                </div>
                 <div>
                    <label className="text-sm dark:text-slate-300">Brand</label>
                    <Input
                      value={brandFilter}
                      onChange={e => setBrandFilter(e.target.value)}
                      placeholder="e.g., Cameron"
                      className="mt-1 dark:text-slate-50 dark:bg-slate-700 dark:border-slate-600"
                    />
                </div>
            </div>

            {/* Results Panel with scroll */}
            <div className="flex-grow overflow-auto border rounded-md dark:border-slate-700">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full dark:text-slate-300">Loading products...</div>
                ) : (
                    <div className="min-w-full">
                      <DataTable columns={columns} data={filteredProducts} />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center gap-2 mt-4 p-1">
                <div className="text-sm dark:text-slate-300">
                    Selected: {Object.keys(selection).length} devices
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                        Cancel
                    </Button>
                    <Button onClick={handleAddClick} disabled={Object.keys(selection).length === 0}>
                        Add to Technical Offer ({Object.keys(selection).length})
                    </Button>
                </div>
            </div>
        </div>
    </Dialog>
  );
}