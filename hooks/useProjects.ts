import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, addProject } from '@/lib/api';

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const addMutation = useMutation({
    mutationFn: addProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects: projects ?? [],
    isLoading,
    error,
    addProject: addMutation.mutate,
  };
}
