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
    onSuccess: (newTaskId, variables) => {
      // Optimistically add the new task to the cache
      queryClient.setQueryData<Array<[bigint, Task]>>(['tasks', variables.proposalId], (old) => {
        if (!old) return [[newTaskId, { id: newTaskId, description: variables.description, completed: false }]];
        return [...old, [newTaskId, { id: newTaskId, description: variables.description, completed: false }]];
      });
      // Also invalidate to ensure consistency with backend
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
    onMutate: async ({ proposalId, taskId, completed }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks', proposalId] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Array<[bigint, Task]>>(['tasks', proposalId]);

      // Optimistically update to the new value
      queryClient.setQueryData<Array<[bigint, Task]>>(['tasks', proposalId], (old) => {
        if (!old) return old;
        return old.map(([id, task]) => {
          if (id === taskId) {
            return [id, { ...task, completed }];
          }
          return [id, task];
        });
      });

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', variables.proposalId], context.previousTasks);
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.proposalId] });
    },
  });
}
