import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useIsAdmin } from './useIsAdmin';
import { getUserFacingError } from '@/utils/userFacingError';
import type { StructuredCivicTask, TaskStatus } from '@/backend';

export function useListTasksByLocation(locationId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StructuredCivicTask[]>({
    queryKey: ['tasks', 'location', locationId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listTasksByLocation(locationId);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && !!locationId,
  });
}

export function useListTasksByIssueId(issueId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StructuredCivicTask[]>({
    queryKey: ['tasks', 'issue', issueId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listTasksByIssueId(issueId);
      } catch (error) {
        console.error('Error fetching tasks by issue:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && !!issueId,
  });
}

export function useGetTask(locationId: string, taskId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StructuredCivicTask>({
    queryKey: ['tasks', 'location', locationId, 'task', taskId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getTask(BigInt(taskId), locationId);
      } catch (error) {
        console.error('Error fetching task:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && !!locationId && !!taskId,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      category: string;
      locationId: string;
      issueId: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        const taskId = await actor.createTask(
          params.title,
          params.description,
          params.category,
          params.locationId,
          params.issueId
        );
        return taskId;
      } catch (error) {
        console.error('Error creating task:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'location', variables.locationId] });
      if (variables.issueId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'issue', variables.issueId] });
      }
    },
  });
}

export function useConvertIssueToTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      category: string;
      locationId: string;
      issueId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        const taskId = await actor.convertIssueToTask(
          params.title,
          params.description,
          params.category,
          params.locationId,
          params.issueId
        );
        return taskId;
      } catch (error) {
        console.error('Error converting issue to task:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'location', variables.locationId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'issue', variables.issueId] });
    },
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      taskId: bigint;
      locationId: string;
      status: TaskStatus;
      title: string;
      description: string;
      category: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.updateTask(
          params.taskId,
          params.title,
          params.description,
          params.category,
          params.locationId,
          params.status
        );
      } catch (error) {
        console.error('Error updating task status:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'location', variables.locationId] });
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'location', variables.locationId, 'task', variables.taskId.toString()],
      });
    },
  });
}

export function useSelfAssignTask() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      taskId: bigint;
      locationId: string;
      title: string;
      description: string;
      category: string;
      status: TaskStatus;
    }) => {
      if (!actor || !identity) throw new Error('Authentication required');
      try {
        // Backend will set assignee to caller automatically
        return await actor.updateTask(
          params.taskId,
          params.title,
          params.description,
          params.category,
          params.locationId,
          params.status
        );
      } catch (error) {
        console.error('Error self-assigning task:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'location', variables.locationId] });
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'location', variables.locationId, 'task', variables.taskId.toString()],
      });
    },
  });
}

export function useAdminAssignTask() {
  const { actor } = useActor();
  const { data: isAdmin } = useIsAdmin();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      taskId: bigint;
      locationId: string;
      assigneePrincipal: string;
      title: string;
      description: string;
      category: string;
      status: TaskStatus;
    }) => {
      if (!actor || !isAdmin) throw new Error('Admin access required');
      try {
        // For now, we'll use the update method; backend needs admin-assign capability
        return await actor.updateTask(
          params.taskId,
          params.title,
          params.description,
          params.category,
          params.locationId,
          params.status
        );
      } catch (error) {
        console.error('Error admin-assigning task:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'location', variables.locationId] });
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'location', variables.locationId, 'task', variables.taskId.toString()],
      });
    },
  });
}
