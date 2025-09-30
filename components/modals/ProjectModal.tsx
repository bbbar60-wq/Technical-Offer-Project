'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { FileWithPath } from 'react-dropzone';
import { Plus } from 'lucide-react';

import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Combobox } from '../ui/Combobox';
import FileUploader from '../FileUploader';
import ClientModal from './ClientModal';

const projectSchema = z.object({
  projectName: z.string().min(1, 'Project Name is required'),
  projectNo: z.string().min(1, 'Project Number is required'),
  clientId: z.string().min(1, 'Please select a client'),
  files: z.array(z.any()).min(1, 'At least one file is required'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const { addProject } = useProjects();
  const { clients } = useClients();
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const clientOptions = clients.map(c => ({ value: c.id, label: c.name }));

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
        projectName: '',
        projectNo: `SGA-0XX-${new Date().getFullYear()}`,
        clientId: '',
        files: [],
    }
  });

  const watchedFiles = watch('files');

  useEffect(() => {
    // Reset form when modal is closed/opened
    if (isOpen) {
        reset({
            projectName: '',
            projectNo: `SGA-0XX-${new Date().getFullYear()}`,
            clientId: '',
            files: [],
        });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: ProjectFormValues) => {
    const projectData = {
        ...data,
        // In a real app, you'd handle file uploads and only store identifiers/URLs
        // For our mock, we just pass the names.
        files: data.files.map((f: File) => f.name),
        // Adding other required Project fields with defaults
        lastRev: '00',
        preparedBy: 'John Doe', // From auth store in a real app
        date: new Date().toISOString().split('T')[0],
        status: 'Draft' as const,
    };

    // We need to remove the 'files' property before passing to addProject
    const { files, ...apiData } = projectData;

    addProject(apiData);
    onClose();
  };

  return (
    <>
      <Dialog isOpen={isOpen} onClose={onClose} title="Create New Project">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Client Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-800 dark:text-slate-100">Client Information</h4>
            <div>
                <label className="text-sm font-medium dark:text-slate-300">Choosing Client</label>
                <div className="flex items-center gap-2 mt-1">
                    <Controller
                        name="clientId"
                        control={control}
                        render={({ field }) => (
                            <Combobox
                                options={clientOptions}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select a client..."
                            />
                        )}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => setIsClientModalOpen(true)} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {errors.clientId && <p className="mt-1 text-xs text-danger">{errors.clientId.message}</p>}
            </div>
          </div>

          {/* Right Column - Project Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-800 dark:text-slate-100">Project Details</h4>
             <div>
                <label className="text-sm font-medium dark:text-slate-300">Project Name</label>
                <Controller name="projectName" control={control} render={({ field }) => <Input {...field} placeholder="e.g., Coastal Refinery Expansion" className="mt-1 dark:bg-slate-700 dark:border-slate-600" />}/>
                {errors.projectName && <p className="mt-1 text-xs text-danger">{errors.projectName.message}</p>}
            </div>
             <div>
                <label className="text-sm font-medium dark:text-slate-300">Project Number</label>
                <Controller name="projectNo" control={control} render={({ field }) => <Input {...field} className="mt-1 dark:bg-slate-700 dark:border-slate-600" />} />
                {errors.projectNo && <p className="mt-1 text-xs text-danger">{errors.projectNo.message}</p>}
            </div>
            <div>
                <label className="text-sm font-medium dark:text-slate-300">File Upload</label>
                <Controller
                    name="files"
                    control={control}
                    render={() => (
                        <FileUploader
                            files={watchedFiles}
                            onFilesChange={(files) => setValue('files', files, { shouldValidate: true })}
                        />
                    )}
                />
                {errors.files && <p className="mt-1 text-xs text-danger">{errors.files.message}</p>}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t dark:border-slate-700">
              <Button type="button" variant="outline" onClick={onClose} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</Button>
              <Button type="submit">Save Project</Button>
          </div>
        </form>
      </Dialog>

      {/* Nested Client Modal */}
      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
    </>
  );
}
