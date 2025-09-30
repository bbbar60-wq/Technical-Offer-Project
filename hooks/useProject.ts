import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectById, addDevicesToRevision, updateDeviceInRevision, revUpProject } from '@/lib/api';
import { Device } from '@/types';

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
  };
}

