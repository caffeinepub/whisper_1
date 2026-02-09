import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

/**
 * Hook to check if an instance name is already taken.
 * Uses debounced input to avoid excessive backend calls.
 */
export function useCheckInstanceName(instanceName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['instanceNameTaken', instanceName],
    queryFn: async () => {
      if (!actor || !instanceName.trim()) return false;
      try {
        return await actor.isInstanceNameTaken(instanceName.trim());
      } catch (error) {
        console.error('Error checking instance name:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching && instanceName.trim().length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Hook to submit a new instance creation proposal.
 * Handles duplicate name rejection with specific error messages.
 */
export function useSubmitProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      description,
      instanceName,
      status,
    }: {
      description: string;
      instanceName: string;
      status: string;
    }) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please try again.');
      }

      const result = await actor.submitProposal(description, instanceName, status);
      
      // If submission failed, check if it's due to duplicate name
      if (!result) {
        // Perform follow-up check to determine the specific error
        const isTaken = await actor.isInstanceNameTaken(instanceName);
        if (isTaken) {
          throw new Error(`The instance name "${instanceName}" is already taken. Please choose a different name.`);
        }
        throw new Error('Failed to submit proposal. Please try again.');
      }
      
      return result;
    },
    onSuccess: () => {
      // Invalidate relevant queries after successful submission
      queryClient.invalidateQueries({ queryKey: ['instanceNameTaken'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}
