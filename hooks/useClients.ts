import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClients,
  addClient,
  updateClient,
  deleteClient,
  addBulkClients // Import bulk add for clients
} from '@/lib/api';
import { Client } from '@/types';

export function useClients() {
  const queryClient = useQueryClient();

  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const addMutation = useMutation({
    mutationFn: (clientData: Omit<Client, 'id'>) => addClient(clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const addBulkMutation = useMutation({
      mutationFn: (clientsData: Omit<Client, 'id'>[]) => addBulkClients(clientsData),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['clients'] });
      }
  });

  const updateMutation = useMutation({
    mutationFn: (clientData: Client) => updateClient(clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (clientId: string) => deleteClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    clients: clients ?? [],
    isLoading,
    error,
    addClient: addMutation.mutate,
    addBulkClients: addBulkMutation.mutate, // Expose bulk add
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
  };
}