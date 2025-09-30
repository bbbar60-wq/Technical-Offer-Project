'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useEffect } from 'react';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { addProduct, updateProduct } = useProducts();
  const isEditMode = !!product;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (isOpen) {
        if (product) {
            reset(product);
        } else {
            reset({ name: '', category: '', brand: '', model: '' });
        }
    }
  }, [isOpen, product, reset]);


  const onSubmit = (data: ProductFormValues) => {
    if (isEditMode && product) {
      updateProduct({ ...product, ...data });
    } else {
      addProduct(data);
    }
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Product' : 'Add New Product'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input {...register('name')} placeholder="Product Name" className="dark:bg-slate-700 dark:border-slate-600" />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <Input {...register('category')} placeholder="Category" className="dark:bg-slate-700 dark:border-slate-600" />
          {errors.category && <p className="mt-1 text-xs text-danger">{errors.category.message}</p>}
        </div>
        <div>
          <Input {...register('brand')} placeholder="Brand" className="dark:bg-slate-700 dark:border-slate-600" />
          {errors.brand && <p className="mt-1 text-xs text-danger">{errors.brand.message}</p>}
        </div>
        <div>
          <Input {...register('model')} placeholder="Model" className="dark:bg-slate-700 dark:border-slate-600" />
          {errors.model && <p className="mt-1 text-xs text-danger">{errors.model.message}</p>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</Button>
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Product'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
