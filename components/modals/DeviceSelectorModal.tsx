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

type Selection = Record<string, { product: Product; qty: number }>;

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
      p.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
      p.category.toLowerCase().includes(categoryFilter.toLowerCase()) &&
      p.brand.toLowerCase().includes(brandFilter.toLowerCase())
    );
  }, [products, nameFilter, categoryFilter, brandFilter]);

  const handleSelectionChange = (product: Product, isSelected: boolean) => {
    setSelection(prev => {
        const newSelection = { ...prev };
        if (isSelected) {
            newSelection[product.id] = { product, qty: 1 };
        } else {
            delete newSelection[product.id];
        }
        return newSelection;
    });
  };

  const handleQtyChange = (product: Product, qty: number) => {
    if (qty > 0) {
        setSelection(prev => ({
            ...prev,
            [product.id]: { product, qty }
        }));
    }
  };

  const handleAddClick = () => {
    const devicesToAdd: Device[] = Object.values(selection).map(({ product, qty }) => ({
        id: product.id,
        name: product.name,
        model: product.model,
        brand: product.brand,
        qty: qty
    }));
    onAddDevices(devicesToAdd);
    setSelection({});
    onClose();
  };

  const columns: ColumnDef<Product>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="dark:bg-slate-700 dark:border-slate-600"
          onChange={(e) => { /* Bulk selection can be added later */ }}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="dark:bg-slate-700 dark:border-slate-600"
          checked={!!selection[row.original.id]}
          onChange={(e) => handleSelectionChange(row.original, e.target.checked)}
        />
      ),
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'brand', header: 'Brand' },
    { accessorKey: 'model', header: 'Model' },
    {
        id: 'quantity',
        header: 'Qty',
        cell: ({ row }) => (
            <Input
                type="number"
                min="1"
                className="h-8 w-20 dark:bg-slate-700 dark:border-slate-600 disabled:dark:bg-slate-800"
                value={selection[row.original.id]?.qty || ''}
                onChange={e => handleQtyChange(row.original, parseInt(e.target.value, 10))}
                disabled={!selection[row.original.id]}
                placeholder="-"
            />
        )
    }
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Select Devices">
        <div className="grid grid-cols-12 gap-6 h-[70vh]">
            {/* Left Filter Panel */}
            <div className="col-span-3 space-y-4 border-r pr-6 dark:border-slate-700">
                <h3 className="font-semibold dark:text-slate-50">Filters</h3>
                <div>
                    <label className="text-sm dark:text-slate-300">Product Name</label>
                    <Input value={nameFilter} onChange={e => setNameFilter(e.target.value)} placeholder="e.g., Transmitter" className="dark:bg-slate-700 dark:border-slate-600" />
                </div>
                 <div>
                    <label className="text-sm dark:text-slate-300">Category</label>
                    <Input value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} placeholder="e.g., Valves" className="dark:bg-slate-700 dark:border-slate-600" />
                </div>
                 <div>
                    <label className="text-sm dark:text-slate-300">Brand</label>
                    <Input value={brandFilter} onChange={e => setBrandFilter(e.target.value)} placeholder="e.g., Cameron" className="dark:bg-slate-700 dark:border-slate-600" />
                </div>
            </div>
            {/* Right Results Panel */}
            <div className="col-span-9 flex flex-col">
                <div className="flex justify-end mb-4">
                    <Button onClick={handleAddClick} disabled={Object.keys(selection).length === 0}>
                        Add to Technical Offer ({Object.keys(selection).length})
                    </Button>
                </div>
                <div className="flex-grow overflow-auto">
                    {isLoading ? <div className="dark:text-slate-300">Loading...</div> : <DataTable columns={columns} data={filteredProducts} />}
                </div>
            </div>
        </div>
    </Dialog>
  );
}
