import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Task } from '@/backend';
import { getUserFacingError } from '@/utils/userFacingError';

export interface TaskWithId {
  id: bigint;
  description: string;
  completed: boolean;
}

export interface CreateTaskSuccess {
  taskId: bigint;
}

interface CreateTaskContext {
  previousTasks?: TaskWithId[];
}

interface UpdateTaskContext {
  previousTasks?: TaskWithId[];
}

/**
 * Hook to fetch tasks for a specific proposal/issue project.
 * Returns tasks with proper loading states and error handling.
 */
export function useGetTasks(proposalId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<TaskWithId[]>({
    queryKey: ['tasks', proposalId],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not available');
      
      try {
        const tasksArray = await actor.getTasks(proposalId);
        return tasksArray.map(([id, task]) => ({
          id,
          description: task.description,
          completed: task.completed,
        }));
      } catch (error) {
        const errorMessage = getUserFacingError(error);
        console.error('Error fetching tasks:', error);
        throw new Error(errorMessage);
      }
    },
    enabled: !!actor && !isFetching && !!proposalId,
  });
}

/**
 * Hook to create a new task for a proposal/issue project.
 * Returns taskId for caller to trigger contribution logging.
 * Uses optimistic updates for immediate UI feedback.
 */
export function useCreateTask(proposalId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<CreateTaskSuccess, Error, string, CreateTaskContext>({
    mutationFn: async (description: string) => {
      if (!actor) throw new Error('Backend connection not available');
      
      try {
        const taskId = await actor.createTask(proposalId, description);
        return { taskId };
      } catch (error) {
        const errorMessage = getUserFacingError(error);
        console.error('Error creating task:', error);
        throw new Error(errorMessage);
      }
    },
    onMutate: async (description) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks', proposalId] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<TaskWithId[]>(['tasks', proposalId]);

      // Optimistically update with temporary ID
      if (previousTasks) {
        const optimisticTask: TaskWithId = {
          id: BigInt(Date.now()), // Temporary ID
          description,
          completed: false,
        };
        queryClient.setQueryData<TaskWithId[]>(['tasks', proposalId], [...previousTasks, optimisticTask]);
      }

      return { previousTasks };
    },
    onError: (err, description, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', proposalId], context.previousTasks);
      }
    },
    onSuccess: () => {
      // Refetch to get the real task ID from backend
      queryClient.invalidateQueries({ queryKey: ['tasks', proposalId] });
    },
  });
}

/**
 * Hook to update task completion status.
 * Uses optimistic updates for immediate UI feedback.
 */
export function useUpdateTaskStatus(proposalId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { taskId: bigint; completed: boolean }, UpdateTaskContext>({
    mutationFn: async ({ taskId, completed }) => {
      if (!actor) throw new Error('Backend connection not available');
      
      try {
        const result = await actor.updateTaskStatus(proposalId, taskId, completed);
        return result;
      } catch (error) {
        const errorMessage = getUserFacingError(error);
        console.error('Error updating task status:', error);
        throw new Error(errorMessage);
      }
    },
    onMutate: async ({ taskId, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks', proposalId] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<TaskWithId[]>(['tasks', proposalId]);

      // Optimistically update
      if (previousTasks) {
        const updatedTasks = previousTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        );
        queryClient.setQueryData<TaskWithId[]>(['tasks', proposalId], updatedTasks);
      }

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', proposalId], context.previousTasks);
      }
    },
    onSuccess: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks', proposalId] });
    },
  });
}
