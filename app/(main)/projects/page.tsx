'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Copy, CheckCircle } from 'lucide-react';
import { Project, ProjectStatus } from '@/types';
import { useProjects } from '@/hooks/useProjects';
import { DataTable } from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import ProjectModal from '@/components/modals/ProjectModal';
import Link from 'next/link';

const StatusPill = ({ status }: { status: ProjectStatus }) => {
  return (
    <span
      className={cn('px-2 py-1 text-xs font-medium rounded-full', {
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': status === 'Draft',
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300': status === 'Submitted',
        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': status === 'Win',
      })}
    >
      {status}
    </span>
  );
};

export default function ProjectsPage() {
  const { projects, isLoading } = useProjects();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const columns: ColumnDef<Project>[] = [
    { accessorKey: 'projectNo', header: 'Project No.' },
    {
     accessorKey: 'projectName',
     header: 'Project Name',
     cell: ({ row }) => {
        const project = row.original;
        return (
          <Link href={`/projects/${project.id}`} className="font-medium text-primary hover:underline">
            {project.projectName}
          </Link>
        )
      }
     },
    { accessorKey: 'lastRev', header: 'Rev' },
    { accessorKey: 'preparedBy', header: 'Prepared By' },
    { accessorKey: 'date', header: 'Date' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusPill status={row.original.status} />
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const project = row.original;
        return (
          <DropdownMenu
            trigger={
              <Button variant="ghost" className="h-8 w-8 p-0 dark:hover:bg-slate-700">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          >
            <DropdownMenuItem onClick={() => alert(`Editing ${project.projectName}`)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert(`Duplicating ${project.projectName}`)}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => alert(`Marking ${project.projectName} as Win`)}>
                <CheckCircle className="mr-2 h-4 w-4" /> Mark Win
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert(`Deleting ${project.projectName}`)} className="text-danger hover:!bg-danger hover:!text-white dark:hover:!bg-danger">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) return <div className="p-6 dark:text-slate-300">Loading projects...</div>;

  return (
    <div>
      <PageHeader
        title="Projects"
        actionLabel="New Project"
        onActionClick={() => setIsProjectModalOpen(true)}
      />

      {/* Filter Bar */}
      <div className="mb-4 flex items-center gap-4 p-4 bg-surface rounded-lg shadow-soft dark:bg-slate-800">
        <Input placeholder="Search by name, number..." className="max-w-xs dark:bg-slate-700 dark:border-slate-600" />
        <div className="h-10 px-4 py-2 border rounded-md text-sm text-neutral-500 dark:border-slate-600 dark:text-slate-400">Status: All</div>
        <div className="h-10 px-4 py-2 border rounded-md text-sm text-neutral-500 dark:border-slate-600 dark:text-slate-400">Prepared By: All</div>
      </div>

      <DataTable columns={columns} data={projects} />

      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
    </div>
  );
}
