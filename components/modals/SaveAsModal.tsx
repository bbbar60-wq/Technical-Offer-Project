'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Download, FileText, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface SaveAsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  currentRev: string;
  activeRevision: any;
}

export default function SaveAsModal({ isOpen, onClose, project, currentRev, activeRevision }: SaveAsModalProps) {
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [fileName, setFileName] = useState('');

  // Set default file name when modal opens
  useState(() => {
    if (isOpen) {
      const defaultName = `${project?.projectNo}_Rev${currentRev}_Export`;
      setFileName(defaultName);
    }
  });

  const handleExport = () => {
    if (!project || !activeRevision) {
      toast.error('Project data not available');
      return;
    }

    try {
      // Prepare comprehensive export data
      const exportData = {
        projectInfo: {
          'Project Name': project.projectName,
          'Project Number': project.projectNo,
          'Revision': currentRev,
          'Date': project.date,
          'Prepared By': project.preparedBy,
          'Status': project.status,
          'Client': project.clientId,
        },
        equipment: activeRevision.devices.map((device: any) => ({
          'Product Name': device.name,
          'Model': device.model,
          'Brand': device.brand,
          'Qty Main': device.qtyMain,
          'Qty Spare': device.qtySpare,
          'Total Qty': device.qtyMain + device.qtySpare,
          'Category': device.productDetails.Category,
          'Type': device.productDetails.TYPE,
          'Range': device.productDetails.Range,
          'Body Material': device.productDetails.body_material,
          'IP Rating': device.productDetails.ip_rating,
          'SIL': device.productDetails.SIL,
          'Protocol': device.productDetails.Protocol,
          'Hazardous Classification': device.productDetails['Hazardous Classification'],
          'Voltage': device.productDetails.Voltage,
          'Technical Specs': device.productDetails.technical_specs,
          'Tag Number': device.productDetails['Tag Number'],
          'Accessories Count': device.accessories?.length || 0,
          'Deviations Count': device.deviations?.length || 0,
          ...(includeDetails && {
            'Accessories Details': device.accessories?.map((acc: any) =>
              `${acc.qty}x ${acc.name} (${acc.partNo})`
            ).join('; ') || '',
            'Deviations Details': device.deviations?.map((dev: any) =>
              `Client: ${dev.clientRequest} | Vendor: ${dev.vendorReply}`
            ).join('; ') || '',
          })
        })),
        generalDeviations: project.generalDeviations || [],
        uploadedFiles: project.uploadedFiles || [],
      };

      if (exportFormat === 'excel') {
        exportToExcel(exportData);
      } else if (exportFormat === 'csv') {
        exportToCSV(exportData);
      } else {
        // PDF export would require additional libraries
        toast.error('PDF export not implemented yet');
        return;
      }

      toast.success(`Project exported as ${exportFormat.toUpperCase()}`);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const exportToExcel = (data: any) => {
    const workbook = XLSX.utils.book_new();

    // Project Info Sheet
    const projectInfoSheet = XLSX.utils.json_to_sheet([data.projectInfo]);
    XLSX.utils.book_append_sheet(workbook, projectInfoSheet, 'Project Info');

    // Equipment Sheet
    const equipmentSheet = XLSX.utils.json_to_sheet(data.equipment);
    XLSX.utils.book_append_sheet(workbook, equipmentSheet, 'Equipment');

    // General Deviations Sheet
    if (data.generalDeviations.length > 0) {
      const deviationsSheet = XLSX.utils.json_to_sheet(data.generalDeviations);
      XLSX.utils.book_append_sheet(workbook, deviationsSheet, 'General Deviations');
    }

    // Uploaded Files Sheet
    if (data.uploadedFiles.length > 0) {
      const filesSheet = XLSX.utils.json_to_sheet(data.uploadedFiles.map((file: any) => ({
        'File Name': file.name,
        'Uploaded By': file.uploadedBy,
        'Date': file.date,
      })));
      XLSX.utils.book_append_sheet(workbook, filesSheet, 'Uploaded Files');
    }

    const finalFileName = `${fileName}.xlsx`;
    XLSX.writeFile(workbook, finalFileName);
  };

  const exportToCSV = (data: any) => {
    // Export only equipment data for CSV (simpler format)
    const worksheet = XLSX.utils.json_to_sheet(data.equipment);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Equipment');

    const finalFileName = `${fileName}.csv`;
    XLSX.writeFile(workbook, finalFileName, { bookType: 'csv' });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Export Project Data" size="lg">
      <div className="space-y-6">
        {/* File Name */}
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-slate-300">
            File Name
          </label>
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name..."
            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
          />
        </div>

        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-slate-300">
            Export Format
          </label>
          <Select
            options={[
              { value: 'excel', label: 'Excel (.xlsx)' },
              { value: 'csv', label: 'CSV (.csv)' },
              { value: 'pdf', label: 'PDF (.pdf)' },
            ]}
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
          />
        </div>

        {/* Options */}
        <div className="p-4 border rounded-lg dark:border-slate-600 bg-muted/50 dark:bg-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-medium dark:text-slate-300">Export Options</span>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeDetails}
              onChange={(e) => setIncludeDetails(e.target.checked)}
              className="rounded border-neutral-300 text-primary focus:ring-primary"
            />
            <span className="text-sm dark:text-slate-300">
              Include detailed accessory and deviation information
            </span>
          </label>
        </div>

        {/* Summary */}
        <div className="p-4 border rounded-lg dark:border-slate-600 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium dark:text-slate-300">Export Summary</span>
          </div>
          <div className="text-sm space-y-1 dark:text-slate-300">
            <div>• Project: {project?.projectName}</div>
            <div>• Revision: {currentRev}</div>
            <div>• Devices: {activeRevision?.devices?.length || 0}</div>
            <div>• Format: {exportFormat.toUpperCase()}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-600">
          <Button variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600">
            Cancel
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Project
          </Button>
        </div>
      </div>
    </Dialog>
  );
}