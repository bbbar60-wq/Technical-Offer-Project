'use client';

import { useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { UploadedFile } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { UploadCloud, FileText, X } from 'lucide-react';

interface UploadCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: Omit<UploadedFile, 'id' | 'url'>) => void;
}

export default function UploadCommentsModal({ isOpen, onClose, onUpload }: UploadCommentsModalProps) {
  const { user } = useAuthStore();
  const [file, setFile] = useState<FileWithPath | null>(null);

  const onDrop = (acceptedFiles: FileWithPath[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleUpload = () => {
    if (!file) return;

    onUpload({
      name: file.name,
      uploadedBy: user?.fullName || 'Unknown User',
      date: new Date().toISOString().split('T')[0],
    });
    setFile(null);
    onClose();
  };

  const removeFile = () => {
    setFile(null);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Upload Client Comments (PDF)">
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors dark:border-slate-600 ${
            isDragActive ? 'border-primary bg-primary/10 dark:bg-primary/20' : 'border-neutral-300 hover:border-primary/50 dark:hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-10 h-10 text-neutral-500" />
          {isDragActive ? (
            <p className="text-primary">Drop the PDF here ...</p>
          ) : (
            <p className="text-neutral-700 dark:text-slate-300">Drag 'n' drop a PDF here, or click to select</p>
          )}
        </div>

        {file && (
          <div className="flex items-center justify-between p-2 bg-muted rounded-md text-sm dark:bg-slate-700">
              <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-neutral-600 dark:text-slate-300" />
                  <span className="dark:text-slate-50">{file.path}</span>
                  <span className="text-neutral-500 text-xs">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-danger" onClick={removeFile}>
                  <X className="h-4 w-4" />
              </Button>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                Cancel
            </Button>
            <Button type="button" onClick={handleUpload} disabled={!file}>
                Upload File
            </Button>
        </div>
      </div>
    </Dialog>
  );
}

