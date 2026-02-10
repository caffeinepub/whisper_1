import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Task } from '@/backend';

export function useGetTasks(proposalId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[bigint, Task]>>({
    queryKey: ['tasks', proposalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTasks(proposalId);
    },
    enabled: !!actor && !actorFetching && !!proposalId,
    retry: false,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, description }: { proposalId: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(proposalId, description);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.proposalId] });
    },
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, taskId, completed }: { proposalId: string; taskId: bigint; completed: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTaskStatus(proposalId, taskId, completed);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.proposalId] });
    },
  });
}
