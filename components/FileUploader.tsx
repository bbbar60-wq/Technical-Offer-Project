'use client';

import { useCallback } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { UploadCloud, FileText, X } from 'lucide-react';
import { Button } from './ui/Button';

interface FileUploaderProps {
  files: FileWithPath[];
  onFilesChange: (files: FileWithPath[]) => void;
}

export default function FileUploader({ files, onFilesChange }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    onFilesChange([...files, ...acceptedFiles]);
  }, [files, onFilesChange]);

  const removeFile = (file: FileWithPath) => {
    onFilesChange(files.filter(f => f !== file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-neutral-300 hover:border-primary/50 dark:border-slate-600 dark:hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-10 h-10 text-neutral-500 mb-2 dark:text-slate-400" />
        {isDragActive ? (
          <p className="text-primary">Drop the files here ...</p>
        ) : (
          <p className="text-neutral-700 dark:text-slate-300">Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
            <h4 className="font-medium text-sm dark:text-slate-50">Uploaded Files:</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm dark:bg-slate-700">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-neutral-600 dark:text-slate-300" />
                    <span className="dark:text-slate-50">{file.path}</span>
                    <span className="text-neutral-500 text-xs dark:text-slate-400">({(file.size / 1024).toFixed(2)} KB)</span>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-danger" onClick={() => removeFile(file)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
