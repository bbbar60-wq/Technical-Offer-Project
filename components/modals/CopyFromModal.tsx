'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import { Project, Device } from '@/types';
import { useProjects } from '@/hooks/useProjects';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface CopyFromModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sourceProjectId: string, sourceRevNo: string) => void;
}

export default function CopyFromModal({ isOpen, onClose, onConfirm }: CopyFromModalProps) {
  const { projects: allProjects, isLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedRevNo, setSelectedRevNo] = useState('');
  const [revisionOptions, setRevisionOptions] = useState<SelectOption[]>([]);

  // Update revision options when selected project changes
  useEffect(() => {
    if (selectedProjectId && allProjects) {
      const project = allProjects.find(p => p.id === selectedProjectId);
      if (project && project.revisions) {
        setRevisionOptions(
          project.revisions
                 .sort((a,b) => b.revNo.localeCompare(a.revNo))
                 .map(rev => ({ value: rev.revNo, label: `Revision ${rev.revNo}` }))
        );
        setSelectedRevNo('');
      } else {
        setRevisionOptions([]);
      }
    } else {
      setRevisionOptions([]);
    }
  }, [selectedProjectId, allProjects]);

  const projectOptions: SelectOption[] = (allProjects || []).map(p => ({
    value: p.id,
    label: `${p.projectNo} - ${p.projectName}`,
  }));

  const exportToCSV = () => {
    if (!selectedProjectId || !selectedRevNo) {
      toast.error('Please select both project and revision');
      return;
    }

    const project = allProjects?.find(p => p.id === selectedProjectId);
    const revision = project?.revisions?.find(r => r.revNo === selectedRevNo);

    if (!project || !revision) {
      toast.error('Selected project or revision not found');
      return;
    }

    // Prepare CSV data
    const csvData = revision.devices.map((device: Device) => ({
      'Product Name': device.name,
      'Model': device.model,
      'Brand': device.brand,
      'Qty Main': device.qtyMain,
      'Qty Spare': device.qtySpare,
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
    }));

    if (csvData.length === 0) {
      toast.error('No devices found in the selected revision');
      return;
    }

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Devices');

    // Generate file name
    const fileName = `${project.projectNo}_Rev${selectedRevNo}_Equipment.csv`;

    // Export as CSV
    XLSX.writeFile(workbook, fileName, { bookType: 'csv' });

    toast.success(`CSV exported: ${fileName}`);
    onClose();
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedProjectId('');
      setSelectedRevNo('');
      setRevisionOptions([]);
    }
  }, [isOpen]);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Export Equipment to CSV">
      <div className="space-y-4">
        <div className="text-sm text-neutral-600 dark:text-slate-300">
          Select a project and revision to export equipment data as CSV file.
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-slate-300">Source Project</label>
          <Select
            options={projectOptions}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            placeholder={isLoading ? "Loading projects..." : "Select a project..."}
            disabled={isLoading}
            className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium dark:text-slate-300">Source Revision</label>
          <Select
            options={revisionOptions}
            value={selectedRevNo}
            onChange={(e) => setSelectedRevNo(e.target.value)}
            placeholder={!selectedProjectId ? "Select project first" : revisionOptions.length > 0 ? "Select a revision..." : "No revisions found"}
            disabled={!selectedProjectId || revisionOptions.length === 0}
            className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
            Cancel
          </Button>
          <Button type="button" onClick={exportToCSV} disabled={!selectedProjectId || !selectedRevNo}>
            Export CSV
          </Button>
        </div>
      </div>
    </Dialog>
  );
}