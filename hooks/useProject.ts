import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjectById,
  addDevicesToRevision,
  updateDeviceInRevision,
  revUpProject,
  addGeneralDeviation,
  addUploadedFile
} from '@/lib/api';
import { Device, GeneralDeviation, UploadedFile } from '@/types';

export function useProject(id: string) {
  const queryClient = useQueryClient();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id),
    enabled: !!id,
  });

  const addDevicesMutation = useMutation({
    mutationFn: (data: { revNo: string, devices: Device[] }) => addDevicesToRevision(id, data.revNo, data.devices),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['project', id] });
    }
  });

  const updateDeviceMutation = useMutation({
    mutationFn: (data: { revNo: string, device: Device }) => updateDeviceInRevision(id, data.revNo, data.device),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['project', id] });
    }
  });

  const revUpMutation = useMutation({
    mutationFn: () => revUpProject(id),
    onSuccess: (data) => {
      // When rev up succeeds, update the query cache immediately
      // and invalidate to ensure freshness
      queryClient.setQueryData(['project', id], data);
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    }
  });

  // NEW MUTATION for General Deviations
  const addGeneralDeviationMutation = useMutation({
    mutationFn: (deviation: Omit<GeneralDeviation, 'id'>) => addGeneralDeviation(id, deviation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    }
  });

  // NEW MUTATION for Uploaded Files
  const addUploadedFileMutation = useMutation({
    mutationFn: (file: Omit<UploadedFile, 'id' | 'url'>) => addUploadedFile(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    }
  });

  return {
    project,
    isLoading,
    error,
    addDevices: addDevicesMutation.mutate,
    updateDevice: updateDeviceMutation.mutate,
    revUpProject: revUpMutation.mutate,
    addGeneralDeviation: addGeneralDeviationMutation.mutate, // <-- Expose new mutation
    addUploadedFile: addUploadedFileMutation.mutate, // <-- Expose new mutation
  };
}

