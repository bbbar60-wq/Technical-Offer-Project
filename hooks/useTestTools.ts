import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTestTools,
  addTestTool,
  updateTestTool,
  deleteTestTool,
  addBulkTestTools // Import bulk add
} from '@/lib/api';
import { TestTool } from '@/types';

export function useTestTools() {
  const queryClient = useQueryClient();

  const { data: testTools, isLoading, error } = useQuery({
    queryKey: ['testTools'],
    queryFn: getTestTools,
  });

  const addMutation = useMutation({
    mutationFn: (toolData: Omit<TestTool, 'id'>) => addTestTool(toolData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testTools'] });
    },
  });

  const addBulkMutation = useMutation({
      mutationFn: (toolsData: Omit<TestTool, 'id'>[]) => addBulkTestTools(toolsData),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['testTools'] });
      }
  });

  const updateMutation = useMutation({
    mutationFn: (toolData: TestTool) => updateTestTool(toolData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testTools'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (toolId: string) => deleteTestTool(toolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testTools'] });
    },
  });

  return {
    testTools: testTools ?? [],
    isLoading,
    error,
    addTestTool: addMutation.mutate,
    addBulkTestTools: addBulkMutation.mutate, // Expose bulk add
    updateTestTool: updateMutation.mutate,
    deleteTestTool: deleteMutation.mutate,
  };
}
