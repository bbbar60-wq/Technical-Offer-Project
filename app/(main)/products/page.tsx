'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { DataTable } from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import ProductModal from '@/components/modals/ProductModal';

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const { products, isLoading, deleteProduct } = useProducts();

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
  };

  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'brand', header: 'Brand' },
    { accessorKey: 'model', header: 'Model' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="dark:hover:bg-slate-700">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-danger dark:hover:bg-danger dark:hover:text-white" onClick={() => deleteProduct(product.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <div className="p-6 dark:text-slate-300">Loading products...</div>;

  return (
    <div>
      <PageHeader title="Products" actionLabel="Add Product" onActionClick={handleAddNew} />
      <DataTable columns={columns} data={products} />
      <ProductModal isOpen={isModalOpen} onClose={closeModal} product={editingProduct} />
    </div>
  );
}
