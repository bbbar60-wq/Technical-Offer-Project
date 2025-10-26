'use client';

import React, { useState, useRef, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2, Upload, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { TestTool } from '@/types';
import { useTestTools } from '@/hooks/useTestTools';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/Button';
import TestToolModal from '@/components/modals/TestToolModal';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Image from 'next/image'; // For image display

// Helper function to normalize header names
const normalizeHeader = (header: string): string => (header || '').trim().toLowerCase();

export default function TestToolsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestTool, setEditingTestTool] = useState<TestTool | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { testTools, isLoading, deleteTestTool, addBulkTestTools } = useTestTools();

  // Filter tools based on search term
  const filteredTestTools = useMemo(() => {
    return (testTools || []).filter(tool =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [testTools, searchTerm]);

  const handleEdit = (tool: TestTool) => {
    setEditingTestTool(tool);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTestTool(undefined);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTestTool(undefined);
  };

  // Handle CSV/Excel file upload
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
             toast.error("Unsupported file type.");
             if (fileInputRef.current) fileInputRef.current.value = "";
             return;
          }

          if (!json || json.length === 0) {
              toast.error("File is empty or invalid.");
              if (fileInputRef.current) fileInputRef.current.value = "";
              return;
          }

          // Map CSV/Excel headers to TestTool keys (case-insensitive)
          const validTools: Omit<TestTool, 'id'>[] = [];
          const headerMap: { [key: string]: keyof Omit<TestTool, 'id'> } = {
              'name': 'name',
              'model': 'model',
              'picture': 'picture' // Assumes a column named 'picture' contains the filename/path
          };

          json.forEach((row, index) => {
              const tool: Partial<Omit<TestTool, 'id'>> = {};
              let hasRequired = true;
              for (const rawKey in row) {
                  const normalizedKey = normalizeHeader(rawKey);
                  const toolKey = headerMap[normalizedKey];
                  if (toolKey) {
                      tool[toolKey] = String(row[rawKey] ?? '');
                  }
              }

              if (!tool.name || !tool.model) {
                  console.warn(`Skipping row ${index + 2}: Missing 'name' or 'model'.`);
                  hasRequired = false;
              }

              if (hasRequired) {
                  validTools.push({
                      name: tool.name!,
                      model: tool.model!,
                      picture: tool.picture ?? '', // Default picture to empty string if missing
                  });
              }
          });

          if (validTools.length > 0) {
              addBulkTestTools(validTools, {
                  onSuccess: () => toast.success(`${validTools.length} test tools imported!`),
                  onError: (err) => toast.error(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
              });
          } else {
              toast.error("No valid test tools found (missing 'name' or 'model').");
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

  // Define columns for the DataTable
  const columns: ColumnDef<TestTool>[] = [
    {
        accessorKey: 'picture',
        header: 'Picture',
        cell: ({ row }) => (
            <div className="w-10 h-10 rounded border flex items-center justify-center bg-muted dark:bg-slate-700 dark:border-slate-600 overflow-hidden text-neutral-400 dark:text-slate-500">
            {row.original.picture ? (
                // In a real app, this would be an Image component with a proper URL
                <ImageIcon className="w-6 h-6" /> // Placeholder icon
            ) : (
                <ImageIcon className="w-6 h-6" />
            )}
            </div>
        ),
        size: 80, // Fixed size for image column
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'model', header: 'Model' },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const tool = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(tool)} className="dark:text-slate-300 dark:hover:bg-slate-700">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-danger" onClick={() => deleteTestTool(tool.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <div className="dark:text-slate-50">Loading test tools...</div>;

  return (
    <div>
      {/* Header with Add and Import Buttons */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-slate-50">Test Tools</h1>
        <div className="flex w-full md:w-auto gap-2">
            <Input
                placeholder="Search by name or model..."
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
                Add Tool
            </Button>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="rounded-lg border bg-surface shadow-soft dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
        <DataTable columns={columns} data={filteredTestTools} />
      </div>

      {/* Modal for Adding/Editing */}
      <TestToolModal isOpen={isModalOpen} onClose={closeModal} testTool={editingTestTool} />
    </div>
  );
}
