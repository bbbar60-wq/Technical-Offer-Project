'use client';

import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Copy, CheckCircle } from 'lucide-react';
import { Project, ProjectStatus } from '@/types';
import { useProjects } from '@/hooks/useProjects'; // Assuming useProjects hook exists
import { DataTable } from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { Select, SelectOption } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import ProjectModal from '@/components/modals/ProjectModal';
import Link from 'next/link';

// Mock user list for "Prepared By" filter
const mockUsers = [
    { value: 'John Doe', label: 'John Doe' },
    { value: 'Jane Smith', label: 'Jane Smith' },
    // Add more users if needed, or fetch dynamically in real app
];

const statusOptions: SelectOption[] = [
    { value: '', label: 'All Statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Win', label: 'Win' },
];

const preparedByOptions: SelectOption[] = [
    { value: '', label: 'All Users' },
    ...mockUsers,
];

const StatusPill = ({ status }: { status: ProjectStatus }) => {
  return (
    <span
      className={cn('px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap', { // Added whitespace-nowrap
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': status === 'Draft',
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': status === 'Submitted',
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': status === 'Win',
      })}
    >
      {status}
    </span>
  );
};

export default function ProjectsPage() {
  // We need useProjects, assume it provides { projects, isLoading }
  const { projects: allProjects, isLoading } = useProjects();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // State for filters (Request 3)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [preparedByFilter, setPreparedByFilter] = useState('');

  // Apply filters (client-side)
  const filteredProjects = useMemo(() => {
    return (allProjects || []).filter(project => {
      const matchesSearch = searchTerm === '' ||
                            (project.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (project.projectNo || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || project.status === statusFilter;
      const matchesPreparedBy = preparedByFilter === '' || project.preparedBy === preparedByFilter;

      return matchesSearch && matchesStatus && matchesPreparedBy;
    });
  }, [allProjects, searchTerm, statusFilter, preparedByFilter]);

  const columns: ColumnDef<Project>[] = [
    { accessorKey: 'projectNo', header: 'Project No.', size: 150 },
    {
     accessorKey: 'projectName',
     header: 'Project Name',
     cell: ({ row }) => {
        const project = row.original;
        return (
          <Link href={`/projects/${project.id}`} className="font-medium text-primary hover:underline dark:text-blue-400">
            {project.projectName}
          </Link>
        )
      },
      size: 300,
     },
    { accessorKey: 'lastRev', header: 'Rev', size: 80 },
    { accessorKey: 'preparedBy', header: 'Prepared By', size: 150 },
    { accessorKey: 'date', header: 'Date', size: 120 },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusPill status={row.original.status} />,
      size: 120,
    },
    {
      id: 'actions',
      header: () => <div className="text-right sticky right-0 bg-surface dark:bg-slate-800 px-4 py-3.5">Actions</div>,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex justify-end sticky right-0 bg-inherit px-4"> {/* Request 4 */}
            <DropdownMenu
              trigger={
                <Button variant="ghost" className="h-8 w-8 p-0 dark:text-slate-300 dark:hover:bg-slate-700">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            >
              {/* Actions remain placeholders */}
              <DropdownMenuItem onClick={() => toast(`Editing ${project.projectName}`)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast(`Duplicating ${project.projectName}`)}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast(`Marking ${project.projectName} as Win`)}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark Win
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.error(`Deleting ${project.projectName}`)} className="text-danger hover:!bg-danger hover:!text-white">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        );
      },
      size: 100, // Fixed size
      minSize: 100,
      maxSize: 100,
    },
  ];

  if (isLoading) return <div className="dark:text-slate-50">Loading projects...</div>;

  return (
    <div>
      <PageHeader
        title="Projects"
        actionLabel="New Project"
        onActionClick={() => setIsProjectModalOpen(true)}
      />

      {/* Filter Bar - Request 3 */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-surface rounded-lg shadow-soft dark:bg-slate-800">
        <Input
          placeholder="Search by name, number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '')} // Cast type
        />
        <Select
          options={preparedByOptions}
          value={preparedByFilter}
          onChange={(e) => setPreparedByFilter(e.target.value)}
        />
      </div>

      {/* Data Table Container - Added overflow-x-auto */}
      <div className="rounded-lg border bg-surface shadow-soft dark:bg-slate-800 dark:border-slate-700 overflow-x-auto">
        <DataTable columns={columns} data={filteredProjects} />
      </div>

      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
    </div>
  );
}

