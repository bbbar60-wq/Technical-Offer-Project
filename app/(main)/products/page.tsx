'use client';

import React, { useState, useRef, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2, Upload, PlusCircle, Image as ImageIcon, FileText } from 'lucide-react';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/Button';
import ProductModal from '@/components/modals/ProductModal';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Helper function to normalize header names
const normalizeHeader = (header: string): string => (header || '').trim().toLowerCase();

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { products, isLoading, deleteProduct, addBulkProducts } = useProducts();

  // Enhanced search across ALL product fields
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (products || []).filter(product =>
      Object.values(product).some(value =>
        value && String(value).toLowerCase().includes(term)
      )
    );
  }, [products, searchTerm]);

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

  // Enhanced CSV/Excel file upload (supports both)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let json: any[] = [];
        try {
          const data = e.target?.result;

          if (file.name.endsWith('.csv')) {
             const textData = new TextDecoder("utf-8").decode(data as ArrayBuffer);
             const workbook = XLSX.read(textData, { type: 'string' });
             const sheetName = workbook.SheetNames[0];
             const worksheet = workbook.Sheets[sheetName];
             json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          } else {
             toast.error("Unsupported file type. Please upload .csv, .xlsx, or .xls files.");
             if (fileInputRef.current) fileInputRef.current.value = "";
             return;
          }

          if (!json || json.length === 0) {
              toast.error("File is empty or invalid.");
              if (fileInputRef.current) fileInputRef.current.value = "";
              return;
          }

          // Map CSV/Excel headers to Product keys (case-insensitive)
          const headerMap: { [key: string]: keyof Omit<Product, 'id'> } = {
              'category': 'Category',
              'name': 'Name',
              'type': 'TYPE',
              'range': 'Range',
              'brand': 'Brand',
              'model': 'Model',
              'body_material': 'body_material',
              'ip_rating': 'ip_rating',
              'sil': 'SIL',
              'protocol': 'Protocol',
              'hazardous classification': 'Hazardous Classification',
              'voltage': 'Voltage',
              'technical_specs': 'technical_specs',
              'img': 'img',
              'tag number': 'Tag Number',
              'datasheet': 'Datasheet ',
              'datasheet ': 'Datasheet ',
              'inastaltions': 'Inastaltions',
              'installations': 'Inastaltions',
          };

          const validProducts: Omit<Product, 'id'>[] = [];

          json.forEach((row, index) => {
              const product: Partial<Omit<Product, 'id'>> = {};
              let hasRequired = true;

              for (const rawKey in row) {
                  const normalizedKey = normalizeHeader(rawKey);
                  const productKey = headerMap[normalizedKey];
                  if (productKey) {
                      product[productKey] = String(row[rawKey] ?? '');
                  }
              }

              if (!product.Name || !product.Model || !product.Category) {
                  console.warn(`Skipping row ${index + 2}: Missing 'Name', 'Model', or 'Category'.`);
                  hasRequired = false;
              }

              if (hasRequired) {
                  validProducts.push({
                      Name: product.Name!,
                      Model: product.Model!,
                      Category: product.Category!,
                      Brand: product.Brand,
                      TYPE: product.TYPE,
                      Range: product.Range,
                      body_material: product.body_material,
                      ip_rating: product.ip_rating,
                      SIL: product.SIL,
                      Protocol: product.Protocol,
                      'Hazardous Classification': product['Hazardous Classification'],
                      Voltage: product.Voltage,
                      technical_specs: product.technical_specs,
                      img: product.img,
                      'Tag Number': product['Tag Number'],
                      'Datasheet ': product['Datasheet '],
                      Inastaltions: product.Inastaltions,
                  });
              }
          });

          if (validProducts.length > 0) {
              addBulkProducts(validProducts, {
                  onSuccess: () => toast.success(`${validProducts.length} products imported!`),
                  onError: (err) => toast.error(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
              });
          } else {
              toast.error("No valid products found (missing 'Name', 'Model', or 'Category').");
          }
        } catch (error) {
            console.error("Error processing file:", error);
            toast.error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.onerror = () => { toast.error("Failed to read file."); if (fileInputRef.current) fileInputRef.current.value = ""; };

      if (file.name.endsWith('.csv')) reader.readAsArrayBuffer(file);
      else reader.readAsBinaryString(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Define ALL columns for the DataTable with horizontal scroll
  const columns: ColumnDef<Product>[] = [
    {
        accessorKey: 'img',
        header: 'Image',
        cell: ({ row }) => (
            <div className="w-10 h-10 rounded border flex items-center justify-center bg-muted dark:bg-slate-700 dark:border-slate-600 overflow-hidden text-neutral-400 dark:text-slate-500">
            {row.original.img ? (
                <ImageIcon className="w-6 h-6" />
            ) : (
                <ImageIcon className="w-6 h-6" />
            )}
            </div>
        ),
        size: 80,
    },
    { accessorKey: 'Category', header: 'Category', size: 120 },
    { accessorKey: 'Name', header: 'Name', size: 150 },
    { accessorKey: 'TYPE', header: 'Type', size: 100 },
    { accessorKey: 'Range', header: 'Range', size: 100 },
    { accessorKey: 'Brand', header: 'Brand', size: 120 },
    { accessorKey: 'Model', header: 'Model', size: 150 },
    { accessorKey: 'body_material', header: 'Body Material', size: 120 },
    { accessorKey: 'ip_rating', header: 'IP Rating', size: 100 },
    { accessorKey: 'SIL', header: 'SIL', size: 80 },
    { accessorKey: 'Protocol', header: 'Protocol', size: 120 },
    { accessorKey: 'Hazardous Classification', header: 'Hazardous Class', size: 140 },
    { accessorKey: 'Voltage', header: 'Voltage', size: 100 },
    {
        accessorKey: 'technical_specs',
        header: 'Tech Specs',
        size: 200,
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate" title={row.original.technical_specs}>
                {row.original.technical_specs}
            </div>
        )
    },
    { accessorKey: 'Tag Number', header: 'Tag Number', size: 120 },
    {
        accessorKey: 'Datasheet ',
        header: 'Datasheet',
        cell: ({ row }) => (
            <div className="w-8 h-8 flex items-center justify-center">
                {row.original['Datasheet '] && <FileText className="w-4 h-4 text-neutral-400" />}
            </div>
        ),
        size: 80,
    },
    {
        accessorKey: 'Inastaltions',
        header: 'Installations',
        cell: ({ row }) => (
            <div className="w-8 h-8 flex items-center justify-center">
                {row.original.Inastaltions && <FileText className="w-4 h-4 text-neutral-400" />}
            </div>
        ),
        size: 80,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="dark:text-slate-300 dark:hover:bg-slate-700">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-danger" onClick={() => deleteProduct(product.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      size: 120,
    },
  ];

  if (isLoading) return <div className="dark:text-slate-50">Loading products...</div>;

  return (
    <div>
      {/* Header with Search, Import and Add Buttons */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-slate-50">Products</h1>
        <div className="flex w-full md:w-auto gap-2">
            <Input
                placeholder="Search across all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow md:flex-grow-0 md:w-64"
            />
            <Button variant="outline" onClick={triggerFileInput} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                <Upload className="mr-2 h-5 w-5" />
                Import File
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls, .csv"
                style={{ display: 'none' }}
            />
            <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Product
            </Button>
        </div>
      </div>

      {/* Data Table Container with horizontal scroll */}
      <div className="rounded-lg border bg-surface shadow-soft dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={filteredProducts} />
        </div>
      </div>

      {/* Modal for Adding/Editing */}
      <ProductModal isOpen={isModalOpen} onClose={closeModal} product={editingProduct} />
    </div>
  );
}