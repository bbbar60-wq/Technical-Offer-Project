'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef, Row, getExpandedRowModel } from '@tanstack/react-table';
import { Device, GeneralDeviation, UploadedFile, Revision } from '@/types';
import {
  HardDriveDownload, PlusCircle, Copy, Upload, ChevronsRight,
  Pencil, Trash2, CheckCircle, XCircle, ChevronRight, FileText, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import DeviceSelectorModal from '@/components/modals/DeviceSelectorModal';
import EditDeviceModal from '@/components/modals/EditDeviceModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import GeneralDeviationModal from '@/components/modals/GeneralDeviationModal';
import UploadCommentsModal from '@/components/modals/UploadCommentsModal';
import DeviceDetailSubRow from '@/components/DeviceDetailSubRow';
import CopyFromModal from '@/components/modals/CopyFromModal';
import { useAuthStore } from '@/store/authStore';
import SparePartsModal from '@/components/modals/SparePartsModal';
import SaveAsModal from '@/components/modals/SaveAsModal';
import { Save } from 'lucide-react';

// Main Workspace Component
export default function ProjectWorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const {
    project,
    isLoading,
    addDevices,
    updateDevice,
    revUpProject,
    addGeneralDeviation,
    addUploadedFile,
    copyRevision
  } = useProject(id);

  // State for the currently viewed revision
  const [currentRev, setCurrentRev] = useState('00'); // Default

  // State for all modals
  const [isDeviceSelectorOpen, setIsDeviceSelectorOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRevUpModalOpen, setIsRevUpModalOpen] = useState(false);
  const [isGenDevModalOpen, setIsGenDevModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCopyFromModalOpen, setIsCopyFromModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [isPreCommissioningModalOpen, setIsPreCommissioningModalOpen] = useState(false);
  const [isTwoYearSpareModalOpen, setIsTwoYearSpareModalOpen] = useState(false);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);

  // State for table expansion
  const [expanded, setExpanded] = useState({});

  // Memoize the latest revision number robustly
  const latestRev = useMemo(() => {
    if (!project || !project.revisions || project.revisions.length === 0) return '00';
    // Sort revisions descendingly by number and pick the first one
    return [...project.revisions].sort((a, b) => b.revNo.localeCompare(a.revNo))[0].revNo;
  }, [project]);

  // This effect automatically switches the view to the newest revision
  useEffect(() => {
    // Check if project and revisions exist before setting state
    if (project && project.revisions && project.revisions.length > 0) {
        // Ensure the currentRev exists, otherwise default to latest
        const currentExists = project.revisions.some(r => r.revNo === currentRev);
        if (!currentExists || currentRev === '00') { // Also switch if it's the initial default
             setCurrentRev(latestRev);
        }
    } else if (project && (!project.revisions || project.revisions.length === 0)) {
        // Handle case where project exists but has no revisions (e.g., just created)
        setCurrentRev('00'); // Default to 00 if no revisions array
    }
  }, [project, latestRev, currentRev]);

  // --- Event Handlers ---
  const handleAddDevices = (devices: Device[]) => {
    if (!project) return;
    addDevices({ revNo: currentRev, devices }, {
        onSuccess: () => toast.success(`${devices.length} device(s) added successfully.`),
        onError: (e) => toast.error(`Error adding devices: ${e instanceof Error ? e.message : 'Unknown error'}`)
    });
  };

  const handleOpenEditModal = (device: Device) => {
    setEditingDevice(device);
    setIsEditModalOpen(true);
  };

  const handleSaveDevice = (updatedDevice: Device) => {
    updateDevice({ revNo: currentRev, device: updatedDevice }, {
        onSuccess: () => toast.success(`Device ${updatedDevice.name} updated successfully.`),
        onError: (e) => toast.error(`Error updating device: ${e instanceof Error ? e.message : 'Unknown error'}`)
    });
  };

  const handleRevUpConfirm = () => {
    revUpProject(undefined, {
      onSuccess: () => toast.success(`Revision ${String(parseInt(latestRev, 10) + 1).padStart(2, '0')} created successfully.`),
      onError: (e) => toast.error(`Error creating revision: ${e instanceof Error ? e.message : 'Unknown error'}`)
    });
    setIsRevUpModalOpen(false);
  };

  const handleSaveGeneralDeviation = (deviation: Omit<GeneralDeviation, 'id'>) => {
    addGeneralDeviation(deviation, {
        onSuccess: () => toast.success("General deviation added."),
        onError: (e) => toast.error(`Error adding deviation: ${e instanceof Error ? e.message : 'Unknown error'}`)
    });
  };

  const handleFileUpload = (file: Omit<UploadedFile, 'id' | 'url'>) => {
    addUploadedFile(file, {
        onSuccess: () => toast.success("File uploaded successfully!"),
        onError: (e) => toast.error(`Error uploading file: ${e instanceof Error ? e.message : 'Unknown error'}`)
    });
  };

  const handleFileDownload = (file: UploadedFile) => {
    // Simulate download using Blob URL
    if (file.url.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name; // Suggest filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloading: ${file.name}`);
    } else {
        toast.error("Cannot simulate download for this file type.");
    }
  };

  const handleGenerateOffer = () => {
    const toastId = toast.loading('Generating technical offer...');

    try {
      if (!project || !activeRevision) {
        throw new Error('Project or revision data not available');
      }

      // Prepare offer data
      const offerData = {
        projectInfo: {
          projectName: project.projectName,
          projectNo: project.projectNo,
          revision: currentRev,
          date: project.date,
          preparedBy: project.preparedBy,
          status: project.status,
        },
        equipment: activeRevision.devices.map(device => ({
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
          'Accessories': device.accessories?.map(acc => `${acc.qty}x ${acc.name} (${acc.partNo})`).join('; ') || '',
          'Deviations': device.deviations?.map(dev => `Client: ${dev.clientRequest} | Vendor: ${dev.vendorReply}`).join('; ') || '',
        })),
        generalDeviations: project.generalDeviations || [],
        uploadedFiles: project.uploadedFiles || [],
      };

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Project Info Sheet
      const projectInfoSheet = XLSX.utils.json_to_sheet([offerData.projectInfo]);
      XLSX.utils.book_append_sheet(workbook, projectInfoSheet, 'Project Info');

      // Equipment Sheet
      const equipmentSheet = XLSX.utils.json_to_sheet(offerData.equipment);
      XLSX.utils.book_append_sheet(workbook, equipmentSheet, 'Equipment');

      // General Deviations Sheet
      if (offerData.generalDeviations.length > 0) {
        const deviationsSheet = XLSX.utils.json_to_sheet(offerData.generalDeviations);
        XLSX.utils.book_append_sheet(workbook, deviationsSheet, 'General Deviations');
      }

      // Generate file name
      const fileName = `${project.projectNo}_Rev${currentRev}_Technical_Offer.xlsx`;

      // Export file
      XLSX.writeFile(workbook, fileName);

      toast.success(`Technical offer generated: ${fileName}`, { id: toastId });
    } catch (error) {
      console.error('Error generating offer:', error);
      toast.error(`Failed to generate offer: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
    }
  };

  const handleCopyFromConfirm = (sourceProjectId: string, sourceRevNo: string) => {
    const toastId = toast.loading('Copying equipment...');
    copyRevision({ targetRevNo: currentRev, sourceProjectId, sourceRevNo }, {
        onSuccess: () => {
            toast.success(`Equipment copied successfully to Rev ${currentRev}.`, { id: toastId });
        },
        onError: (error) => {
            toast.error(`Failed to copy equipment: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
        }
    });
  };

  // --- Render Logic ---

  // Enhanced Loading/Error States
  if (isLoading) {
    return <div className="p-6 dark:text-slate-50">Loading project workspace...</div>;
  }

  // Explicit check if project is null/undefined AFTER loading
  if (!project) {
    return <div className="p-6 dark:text-slate-50">Project not found or failed to load.</div>;
  }

  // Ensure revisions array exists before trying to find the active one
  const safeRevisions = project.revisions || [];
  const activeRevision = safeRevisions.find(r => r.revNo === currentRev);
  const sortedRevisions = [...safeRevisions].sort((a,b) => a.revNo.localeCompare(b.revNo));

  // --- Column Definitions ---

  // Columns for the Equipment/Device data table
  const deviceColumns: ColumnDef<Device>[] = [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => {
        return (
          <button
            onClick={row.getToggleExpandedHandler()}
            className="p-1 rounded-md hover:bg-muted dark:hover:bg-slate-700"
            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
          >
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform duration-200 dark:text-slate-300",
              row.getIsExpanded() ? "rotate-90" : "rotate-0"
            )} />
          </button>
        );
      },
      enableResizing: false,
      enableSorting: false,
      size: 40,
      minSize: 40,
      maxSize: 40,
    },
    { accessorKey: 'name', header: 'Product Name', size: 250 },
    {
        accessorKey: 'brand',
        header: 'Model / Brand',
        cell: ({ row }) => `${row.original.model} / ${row.original.brand}`,
        size: 250
    },
    { accessorKey: 'qtyMain', header: 'Qty: Main', size: 100 },
    { accessorKey: 'qtySpare', header: 'Qty: Spare', size: 100 },
    {
        id: 'acc',
        header: 'Acc',
        cell: ({ row }) => {
            const hasAcc = (row.original.accessories?.length || 0) > 0;
            return hasAcc ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-neutral-400 mx-auto" />
        },
        size: 80
    },
    {
        id: 'dev',
        header: 'Dev',
        cell: ({ row }) => {
            const hasDev = (row.original.deviations?.length || 0) > 0;
            return hasDev ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-neutral-400 mx-auto" />
        },
        size: 80
    },
    {
        id: 'actions',
        header: () => <div className="text-right sticky right-0 bg-surface dark:bg-slate-800 px-4 py-3.5">Actions</div>,
        cell: ({ row }) => (
            <div className="flex justify-end gap-2 sticky right-0 bg-inherit px-4">
                <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(row.original)} className="dark:text-slate-300 dark:hover:bg-slate-700">
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-danger">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        ),
        size: 100, minSize: 100, maxSize: 100,
    },
  ];

  // Columns for the General Deviations table
  const genDevColumns: ColumnDef<GeneralDeviation>[] = [
    { accessorKey: 'date', header: 'Date', size: 120 },
    { accessorKey: 'author', header: 'Author', size: 150 },
    { accessorKey: 'deviation', header: 'Deviation Note' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="p-4 bg-surface rounded-lg shadow-soft space-y-4 dark:bg-slate-800 dark:border dark:border-slate-700">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-slate-50">{project.projectName}</h1>
                <p className="text-sm text-neutral-600 dark:text-slate-400">{project.projectNo}</p>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGenDevModalOpen(true)} className="dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600">
                General Deviations
              </Button>
              <Button variant="outline" onClick={() => setIsCopyFromModalOpen(true)} className="dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600">
                <Copy className="mr-2 h-4 w-4"/> Export CSV
              </Button>
              <Button variant="outline" onClick={() => setIsUploadModalOpen(true)} className="dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600">
                <Upload className="mr-2 h-4 w-4"/> Upload Comments
              </Button>
              <Button variant="outline" onClick={() => setIsSaveAsModalOpen(true)} className="dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600">
                <Save className="mr-2 h-4 w-4"/> Save As
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsRevUpModalOpen(true)}
                disabled={currentRev !== latestRev}
                className="disabled:opacity-50 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600"
              >
                <ChevronsRight className="mr-2 h-4 w-4"/> Rev Up
              </Button>
              <Button onClick={handleGenerateOffer}><HardDriveDownload className="mr-2 h-4 w-4"/> Generate Offer</Button>
            </div>
        </div>
        {/* Meta Info */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-3 dark:text-slate-300 dark:border-slate-700">
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Date:</strong> {project.date}</p>
            <p><strong>Prepared By:</strong> {project.preparedBy}</p>
        </div>
      </div>

      {/* General Deviations Table */}
      {(project.generalDeviations?.length || 0) > 0 && (
        <div className="p-4 bg-surface rounded-lg shadow-soft dark:bg-slate-800 dark:border dark:border-slate-700">
          <h2 className="text-xl font-bold mb-4 dark:text-slate-50">General Deviations</h2>
          <div className="rounded-lg border dark:border-slate-700 overflow-hidden">
            <DataTable columns={genDevColumns} data={project.generalDeviations || []} />
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {(project.uploadedFiles?.length || 0) > 0 && (
        <div className="p-4 bg-surface rounded-lg shadow-soft dark:bg-slate-800 dark:border dark:border-slate-700">
          <h2 className="text-xl font-bold mb-4 dark:text-slate-50">Uploaded Comments</h2>
          <div className="space-y-2">
            {project.uploadedFiles?.map(file => (
              <div key={file.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-muted rounded-md dark:bg-slate-700 gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="overflow-hidden">
                    <span className="font-medium dark:text-slate-50 block truncate" title={file.name}>{file.name}</span>
                    <p className="text-xs text-neutral-600 dark:text-slate-400">Uploaded by {file.uploadedBy} on {file.date}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleFileDownload(file)} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 self-end sm:self-center flex-shrink-0">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revisions & Equipment Section */}
      <div className="p-4 bg-surface rounded-lg shadow-soft dark:bg-slate-800 dark:border dark:border-slate-700">
        {/* Revision Tabs */}
        <div className="border-b mb-4 dark:border-slate-700 overflow-x-auto">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {sortedRevisions.length > 0 ? sortedRevisions.map((rev) => (
                    <button
                        key={rev.revNo}
                        onClick={() => setCurrentRev(rev.revNo)}
                        className={cn(
                            'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                            currentRev === rev.revNo
                                ? 'border-primary text-primary'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'
                        )}
                    >
                        Revision {rev.revNo}
                    </button>
                )) : (
                     <span className="py-3 px-1 text-sm text-neutral-500 dark:text-slate-400">No Revisions Yet</span>
                 )}
            </nav>
        </div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-slate-50">Equipment (Revision {currentRev})</h2>
            <Button onClick={() => setIsDeviceSelectorOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Device
            </Button>
        </div>
        {/* Data Table Container - Added overflow-x-auto */}
        <div className="rounded-lg border dark:border-slate-700 overflow-x-auto">
          <DataTable
            columns={deviceColumns}
            data={activeRevision?.devices || []}
            renderSubComponent={(row: Row<Device>) => <DeviceDetailSubRow device={row.original} />}
            getRowCanExpand={() => true}
            options={{
              state: { expanded },
              onExpandedChange: setExpanded,
              getExpandedRowModel: getExpandedRowModel(),
            }}
          />
        </div>
      </div>

      {/* Spare Parts Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pre-commissioning Spare Parts */}
        <div className="p-4 bg-surface rounded-lg shadow-soft dark:bg-slate-800 dark:border dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-slate-50">Pre-commissioning & Commissioning Spare Parts</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreCommissioningModalOpen(true)}
              className="dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </div>
          <div className="text-sm text-neutral-600 dark:text-slate-400">
            Manage spare parts required for pre-commissioning and commissioning phases.
          </div>
        </div>

        {/* Two-Year Spare Parts */}
        <div className="p-4 bg-surface rounded-lg shadow-soft dark:bg-slate-800 dark:border dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-slate-50">Two-Year Spare Parts</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTwoYearSpareModalOpen(true)}
              className="dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </div>
          <div className="text-sm text-neutral-600 dark:text-slate-400">
            Manage spare parts required for the first two years of operation.
          </div>
        </div>
      </div>

      {/* --- ALL MODALS --- */}
      <DeviceSelectorModal
        isOpen={isDeviceSelectorOpen}
        onClose={() => setIsDeviceSelectorOpen(false)}
        onAddDevices={handleAddDevices}
      />
      <EditDeviceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        device={editingDevice}
        onSave={handleSaveDevice}
      />
      <ConfirmDialog
        isOpen={isRevUpModalOpen}
        onClose={() => setIsRevUpModalOpen(false)}
        onConfirm={handleRevUpConfirm}
        title="Create New Revision"
        description={`Are you sure you want to create Revision ${String(parseInt(latestRev || '-1', 10) + 1).padStart(2, '0')} from Revision ${latestRev}? This will copy all existing devices.`}
      />
      <GeneralDeviationModal
        isOpen={isGenDevModalOpen}
        onClose={() => setIsGenDevModalOpen(false)}
        onSave={handleSaveGeneralDeviation}
      />
      <UploadCommentsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
      />
      <CopyFromModal
        isOpen={isCopyFromModalOpen}
        onClose={() => setIsCopyFromModalOpen(false)}
        onConfirm={handleCopyFromConfirm}
      />
      <SparePartsModal
        isOpen={isPreCommissioningModalOpen}
        onClose={() => setIsPreCommissioningModalOpen(false)}
        type="pre-commissioning"
        projectId={id}
      />
      <SparePartsModal
        isOpen={isTwoYearSpareModalOpen}
        onClose={() => setIsTwoYearSpareModalOpen(false)}
        type="two-year"
        projectId={id}
      />
      <SaveAsModal
        isOpen={isSaveAsModalOpen}
        onClose={() => setIsSaveAsModalOpen(false)}
        project={project}
        currentRev={currentRev}
        activeRevision={activeRevision}
      />
    </div>
  );
}