'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, FileText, X } from 'lucide-react';

// Define the schema for the product form
const productSchema = z.object({
  Name: z.string().min(1, 'Name is required'),
  Model: z.string().min(1, 'Model is required'),
  Category: z.string().min(1, 'Category is required'),
  Brand: z.string().optional(),
  TYPE: z.string().optional(),
  Range: z.string().optional(),
  body_material: z.string().optional(),
  ip_rating: z.string().optional(),
  SIL: z.string().optional(),
  Protocol: z.string().optional(),
  'Hazardous Classification': z.string().optional(),
  Voltage: z.string().optional(),
  technical_specs: z.string().optional(),
  'Tag Number': z.string().optional(),
  imgFile: z.instanceof(File).optional(),
  datasheetFile: z.instanceof(File).optional(),
  installationsFile: z.instanceof(File).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

// Helper function to format the image path for next/image
const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('blob:') || path.startsWith('http')) {
    return path;
  }
  return `/${path}`;
};

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { addProduct, updateProduct } = useProducts();
  const isEditMode = !!product;

  const [previewUrl, setPreviewUrl] = useState<string | null>(getImageUrl(product?.img));
  const [datasheetFile, setDatasheetFile] = useState<File | null>(null);
  const [installationsFile, setInstallationsFile] = useState<File | null>(null);

  const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      Name: '',
      Model: '',
      Category: '',
      Brand: '',
      TYPE: '',
      Range: '',
      body_material: '',
      ip_rating: '',
      SIL: '',
      Protocol: '',
      'Hazardous Classification': '',
      Voltage: '',
      technical_specs: '',
      'Tag Number': '',
      imgFile: undefined,
      datasheetFile: undefined,
      installationsFile: undefined,
    }
  });

  const imgFile = watch('imgFile');
  const watchDatasheetFile = watch('datasheetFile');
  const watchInstallationsFile = watch('installationsFile');

  // Generate preview URL for new image
  useEffect(() => {
    if (imgFile) {
      const url = URL.createObjectURL(imgFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (product?.img) {
      setPreviewUrl(getImageUrl(product.img));
    } else {
      setPreviewUrl(null);
    }
  }, [imgFile, product?.img]);

  // Handle file changes
  useEffect(() => {
    if (watchDatasheetFile) {
      setDatasheetFile(watchDatasheetFile);
    } else if (product?.['Datasheet ']) {
      setDatasheetFile(null); // Reset if no file but keep existing path
    } else {
      setDatasheetFile(null);
    }
  }, [watchDatasheetFile, product?.['Datasheet ']]);

  useEffect(() => {
    if (watchInstallationsFile) {
      setInstallationsFile(watchInstallationsFile);
    } else if (product?.Inastaltions) {
      setInstallationsFile(null); // Reset if no file but keep existing path
    } else {
      setInstallationsFile(null);
    }
  }, [watchInstallationsFile, product?.Inastaltions]);

  // Reset form when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
        if (product) {
            reset({
              Name: product.Name || '',
              Model: product.Model || '',
              Category: product.Category || '',
              Brand: product.Brand || '',
              TYPE: product.TYPE || '',
              Range: product.Range || '',
              body_material: product.body_material || '',
              ip_rating: product.ip_rating || '',
              SIL: product.SIL || '',
              Protocol: product.Protocol || '',
              'Hazardous Classification': product['Hazardous Classification'] || '',
              Voltage: product.Voltage || '',
              technical_specs: product.technical_specs || '',
              'Tag Number': product['Tag Number'] || '',
              imgFile: undefined,
              datasheetFile: undefined,
              installationsFile: undefined,
            });
            setPreviewUrl(getImageUrl(product.img));
            setDatasheetFile(null);
            setInstallationsFile(null);
        } else {
            reset({
              Name: '',
              Model: '',
              Category: '',
              Brand: '',
              TYPE: '',
              Range: '',
              body_material: '',
              ip_rating: '',
              SIL: '',
              Protocol: '',
              'Hazardous Classification': '',
              Voltage: '',
              technical_specs: '',
              'Tag Number': '',
              imgFile: undefined,
              datasheetFile: undefined,
              installationsFile: undefined,
            });
            setPreviewUrl(null);
            setDatasheetFile(null);
            setInstallationsFile(null);
        }
    }
  }, [isOpen, product, reset]);

  const onSubmit = (data: ProductFormValues) => {
    // Handle file paths
    const imgPath = data.imgFile ? data.imgFile.name : (product?.img || '');
    const datasheetPath = data.datasheetFile ? data.datasheetFile.name : (product?.['Datasheet '] || '');
    const installationsPath = data.installationsFile ? data.installationsFile.name : (product?.Inastaltions || '');

    // Remove file properties before submitting
    const { imgFile, datasheetFile, installationsFile, ...productData } = data;

    const finalProductData = {
      ...productData,
      img: imgPath,
      'Datasheet ': datasheetPath,
      Inastaltions: installationsPath
    };

    if (isEditMode && product) {
      updateProduct({ ...product, ...finalProductData });
    } else {
      addProduct(finalProductData);
    }
    onClose();
  };

  // File upload component
  const renderFileUpload = (
    name: 'datasheetFile' | 'installationsFile',
    label: string,
    currentFile: File | null,
    existingFileName?: string
  ) => (
    <div>
      <label className="block text-sm font-medium dark:text-slate-300 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        {(currentFile || existingFileName) && (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted dark:bg-slate-700 rounded-md">
            <FileText className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-700 dark:text-slate-300 max-w-[200px] truncate">
              {currentFile ? currentFile.name : existingFileName}
            </span>
          </div>
        )}
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, onBlur, name, ref } }) => (
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.xls"
              onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
              onBlur={onBlur}
              name={name}
              ref={ref}
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-slate-600 dark:file:text-slate-300 dark:hover:file:bg-slate-500"
            />
          )}
        />
      </div>
    </div>
  );

  // Helper to reduce repetition for text inputs
  const renderFormInput = (id: keyof ProductFormValues, label: string, required = false) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium dark:text-slate-300">
        {label}{required && <span className="text-danger">*</span>}
      </label>
      <Input
        id={id}
        {...register(id)}
        placeholder={label}
        className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
      />
      {errors[id] && <p className="mt-1 text-xs text-danger">{(errors[id] as any).message}</p>}
    </div>
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Product' : 'Add New Product'} size="2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFormInput('Name', 'Name', true)}
          {renderFormInput('Model', 'Model', true)}
          {renderFormInput('Category', 'Category', true)}
          {renderFormInput('Brand', 'Brand')}
          {renderFormInput('TYPE', 'Type')}
          {renderFormInput('Range', 'Range')}
          {renderFormInput('body_material', 'Body Material')}
          {renderFormInput('ip_rating', 'IP Rating')}
          {renderFormInput('SIL', 'SIL')}
          {renderFormInput('Protocol', 'Protocol')}
          {renderFormInput('Hazardous Classification', 'Hazardous Classification')}
          {renderFormInput('Voltage', 'Voltage')}
          {renderFormInput('Tag Number', 'Tag Number')}
        </div>

        {/* Full-width text area */}
        <div>
          <label htmlFor="technical_specs" className="block text-sm font-medium dark:text-slate-300">
            Technical Specs
          </label>
          <textarea
            id="technical_specs"
            {...register('technical_specs')}
            placeholder="Enter technical specs..."
            rows={4}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:placeholder-slate-400"
          />
          {errors.technical_specs && <p className="mt-1 text-xs text-danger">{errors.technical_specs.message}</p>}
        </div>

        {/* File Uploads Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t dark:border-slate-600">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 mb-2">Product Image</label>
            <div className="flex flex-col gap-3">
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
              <Controller
                name="imgFile"
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
            {errors.imgFile && <p className="mt-1 text-xs text-danger">{errors.imgFile.message}</p>}
          </div>

          {/* Datasheet Upload */}
          {renderFileUpload(
            'datasheetFile',
            'Datasheet',
            datasheetFile,
            product?.['Datasheet ']
          )}

          {/* Installations Upload */}
          {renderFileUpload(
            'installationsFile',
            'Installations',
            installationsFile,
            product?.Inastaltions
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-600">
          <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
            Cancel
          </Button>
          <Button type="submit">
            {isEditMode ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}