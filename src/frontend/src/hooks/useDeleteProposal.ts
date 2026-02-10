import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

/**
 * React Query mutation hook for deleting a proposal.
 * Invalidates moderation and proposal queries on success.
 */
export function useDeleteProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instanceName: string) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      
      const result = await actor.deleteProposal(instanceName);
      
      if (!result) {
        throw new Error('Failed to delete proposal');
      }
      
      return result;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['moderationItems'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}
