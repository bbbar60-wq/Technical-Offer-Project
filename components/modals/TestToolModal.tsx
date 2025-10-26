'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TestTool } from '@/types';
import { useTestTools } from '@/hooks/useTestTools';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import Image from 'next/image'; // For image preview
import { UploadCloud } from 'lucide-react'; // Icon for placeholder

const testToolSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  model: z.string().min(1, 'Model is required'),
  pictureFile: z.instanceof(File).optional(), // Accept File object
});

type TestToolFormValues = z.infer<typeof testToolSchema>;

interface TestToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  testTool?: TestTool;
}

// --- HELPER FUNCTION ---
// Formats the image path for next/image
const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  // If it's a new blob URL or an absolute URL, use it as-is
  if (path.startsWith('blob:') || path.startsWith('http')) {
    return path;
  }
  // Otherwise, assume it's a relative path from /public
  return `/${path}`;
};
// -----------------------

export default function TestToolModal({ isOpen, onClose, testTool }: TestToolModalProps) {
  const { addTestTool, updateTestTool } = useTestTools();
  const isEditMode = !!testTool;

  // Use the helper function to set the initial state
  const [previewUrl, setPreviewUrl] = useState<string | null>(getImageUrl(testTool?.picture));

  const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm<TestToolFormValues>({
    resolver: zodResolver(testToolSchema),
    defaultValues: { name: '', model: '', pictureFile: undefined }
  });

  const pictureFile = watch('pictureFile');

  // Generate preview URL when file changes
  useEffect(() => {
    if (pictureFile) {
      const url = URL.createObjectURL(pictureFile);
      setPreviewUrl(url);
      // Clean up the object URL when the component unmounts or file changes
      return () => URL.revokeObjectURL(url);
    } else if (testTool?.picture) {
        // Use helper function when tool data changes
        setPreviewUrl(getImageUrl(testTool.picture));
    } else {
        setPreviewUrl(null);
    }
  }, [pictureFile, testTool?.picture]);

  useEffect(() => {
    if (isOpen) {
        if (testTool) {
            reset({
              name: testTool.name,
              model: testTool.model,
              pictureFile: undefined // Don't prefill file input
            });
            // Use helper function on open
            setPreviewUrl(getImageUrl(testTool.picture));
        } else {
            reset({ name: '', model: '', pictureFile: undefined });
            setPreviewUrl(null);
        }
    }
  }, [isOpen, testTool, reset]);


  const onSubmit = (data: TestToolFormValues) => {
    // We only store the filename, not the leading '/'
    const picturePath = data.pictureFile ? data.pictureFile.name : (testTool?.picture || '');

    const toolData = {
        name: data.name,
        model: data.model,
        picture: picturePath
    };

    if (isEditMode && testTool) {
      updateTestTool({ ...testTool, ...toolData });
    } else {
      addTestTool(toolData);
    }
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Test Tool' : 'Add New Test Tool'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium dark:text-slate-300">
            Name<span className="text-danger">*</span>
          </label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Tool Name"
            className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>

        {/* Model Input */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium dark:text-slate-300">
            Model<span className="text-danger">*</span>
          </label>
          <Input
            id="model"
            {...register('model')}
            placeholder="Tool Model"
            className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
          />
          {errors.model && <p className="mt-1 text-xs text-danger">{errors.model.message}</p>}
        </div>

        {/* Picture Upload */}
        <div>
            <label className="block text-sm font-medium dark:text-slate-300 mb-1">Picture</label>
            <div className="flex items-center gap-4">
                 {/* Preview or Placeholder */}
                <div className="w-24 h-24 rounded border flex items-center justify-center bg-muted dark:bg-slate-700 dark:border-slate-600 overflow-hidden">
                    {/* Only render Image if previewUrl is a valid string */}
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="Preview"
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                            onError={() => setPreviewUrl(null)} // Fallback if src is bad
                        />
                    ) : (
                        <UploadCloud className="w-8 h-8 text-neutral-400 dark:text-slate-500" />
                    )}
                </div>
                {/* File Input */}
                <Controller
                    name="pictureFile"
                    control={control}
                    render={({ field: { onChange, onBlur, name, ref } }) => (
                         <Input
                            type="file"
                            accept="image/*" // Accept only image files
                            onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                            onBlur={onBlur}
                            name={name}
                            ref={ref}
                            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-slate-600 dark:file:text-slate-300 dark:hover:file:bg-slate-500"
                        />
                    )}
                />

            </div>
            {errors.pictureFile && <p className="mt-1 text-xs text-danger">{errors.pictureFile.message}</p>}
        </div>


        <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-600">
            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</Button>
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Test Tool'}</Button>
        </div>
      </form>
    </Dialog>
  );
}