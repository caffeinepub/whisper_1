import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

/**
 * Hook to update a proposal's status (approve/reject).
 * Invalidates and refetches the proposals list after successful update.
 */
export function useUpdateProposalStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      instanceName,
      newStatus,
    }: {
      instanceName: string;
      newStatus: string;
    }) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please try again.');
      }

      // Validate status before sending to backend
      const validStatuses = ['Approved', 'Rejected'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}. Only Approved or Rejected are allowed.`);
      }

      const result = await actor.updateProposalStatus(instanceName, newStatus);
      
      if (!result) {
        // Backend returns false for multiple reasons:
        // 1. Proposal doesn't exist
        // 2. Proposal is not in Pending status
        // 3. Invalid status transition
        throw new Error(
          `Unable to update proposal status. The proposal may not exist, may not be in Pending status, or the status transition is not allowed.`
        );
      }
      
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific proposal to refresh UI
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', variables.instanceName] });
    },
  });
}
