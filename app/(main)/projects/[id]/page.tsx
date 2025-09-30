'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Device } from '@/types';
import { HardDriveDownload, PlusCircle, Copy, Upload, ChevronsRight, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import DeviceSelectorModal from '@/components/modals/DeviceSelectorModal';
import EditDeviceModal from '@/components/modals/EditDeviceModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';

// Main Workspace Component
export default function ProjectWorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  const { project, isLoading, addDevices, updateDevice, revUpProject } = useProject(id);

  // State for the currently viewed revision
  const [currentRev, setCurrentRev] = useState('00');

  // State for all modals
  const [isDeviceSelectorOpen, setIsDeviceSelectorOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRevUpModalOpen, setIsRevUpModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Memoize the latest revision number to efficiently check for it
  const latestRev = useMemo(() => {
    if (!project) return '00';
    // Sort revisions descendingly by number and pick the first one
    return project.revisions.sort((a, b) => b.revNo.localeCompare(a.revNo))[0].revNo;
  }, [project]);

  // This effect automatically switches the view to the newest revision when the project data changes (e.g., after a rev up)
  useEffect(() => {
    if (project) {
        setCurrentRev(latestRev);
    }
  }, [project, latestRev]);

  // --- Event Handlers ---

  const handleAddDevices = (devices: Device[]) => {
    if (!project) return;
    addDevices({ revNo: currentRev, devices });
  };

  const handleOpenEditModal = (device: Device) => {
    setEditingDevice(device);
    setIsEditModalOpen(true);
  };

  const handleSaveDevice = (updatedDevice: Device) => {
    updateDevice({ revNo: currentRev, device: updatedDevice });
  };

  const handleRevUpConfirm = () => {
    revUpProject();
    setIsRevUpModalOpen(false);
  };

  const handleGenerateOffer = () => {
    // Show a loading toast that will be updated
    const toastId = toast.loading('Generating technical offer...');

    // Simulate a backend process that takes time
    setTimeout(() => {
        // Update the original toast to a success message
        toast.success('Offer generated successfully! Download will start shortly.', {
            id: toastId, // Use the same ID to update the toast
        });
    }, 3000); // 3-second delay
  };


  // --- Render Logic ---

  if (isLoading) {
    return <div className="p-6 dark:text-slate-300">Loading project workspace...</div>;
  }

  if (!project) {
    return <div className="p-6 dark:text-slate-300">Project not found.</div>;
  }

  const activeRevision = project.revisions.find(r => r.revNo === currentRev);

  // Columns definition for the Equipment/Device data table
  const deviceColumns: ColumnDef<Device>[] = [
    { accessorKey: 'name', header: 'Product Name' },
    {
        accessorKey: 'brand',
        header: 'Model / Brand',
        cell: ({ row }) => `${row.original.model} / ${row.original.brand}`
    },
    { accessorKey: 'qty', header: 'Qty' },
    {
        id: 'acc',
        header: 'Acc',
        cell: () => <span className="text-neutral-400 dark:text-slate-500">0</span> // Placeholder
    },
    {
        id: 'dev',
        header: 'Dev',
        cell: ({ row }) => (
            <span className={cn(row.original.deviations && row.original.deviations.length > 0 ? 'font-bold text-primary' : 'dark:text-slate-300')}>
                {row.original.deviations?.length || 0}
            </span>
        )
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(row.original)} className="dark:hover:bg-slate-700">
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-danger dark:hover:bg-danger dark:hover:text-white">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="p-4 bg-surface rounded-lg shadow-soft dark:bg-slate-800">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-slate-50">{project.projectName}</h1>
                <p className="text-sm text-neutral-600 dark:text-slate-400">{project.projectNo}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" className="dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"><Copy className="mr-2 h-4 w-4"/> Copy From</Button>
                <Button variant="outline" className="dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"><Upload className="mr-2 h-4 w-4"/> Upload Comments</Button>
                <Button
                    variant="outline"
                    onClick={() => setIsRevUpModalOpen(true)}
                    disabled={currentRev !== latestRev} // Button is disabled if not on the latest revision
                    className="dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 disabled:dark:bg-slate-800 disabled:dark:text-slate-500"
                >
                    <ChevronsRight className="mr-2 h-4 w-4"/> Rev Up
                </Button>
                <Button onClick={handleGenerateOffer}><HardDriveDownload className="mr-2 h-4 w-4"/> Generate Offer</Button>
            </div>
        </div>
        <div className="flex items-center gap-4 text-sm border-t pt-3 dark:border-slate-700 dark:text-slate-300">
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Date:</strong> {project.date}</p>
            <p><strong>Prepared By:</strong> {project.preparedBy}</p>
        </div>
      </div>

      {/* Revisions & Equipment Section */}
      <div className="p-4 bg-surface rounded-lg shadow-soft dark:bg-slate-800">
        {/* Revision Tabs */}
        <div className="border-b dark:border-slate-700 mb-4">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {project.revisions.map((rev) => (
                    <button
                        key={rev.revNo}
                        onClick={() => setCurrentRev(rev.revNo)}
                        className={cn(
                            'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                            currentRev === rev.revNo
                                ? 'border-primary text-primary'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
                        )}
                    >
                        Revision {rev.revNo}
                    </button>
                ))}
            </nav>
        </div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-slate-50">Equipment</h2>
            <Button onClick={() => setIsDeviceSelectorOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Device
            </Button>
        </div>
        <DataTable columns={deviceColumns} data={activeRevision?.devices || []} />
      </div>

      {/* All Modals are rendered here */}
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
        description={`Are you sure you want to create Revision ${String(parseInt(latestRev, 10) + 1).padStart(2, '0')} from Revision ${latestRev}? This will copy all existing devices.`}
      />
    </div>
  );
}

