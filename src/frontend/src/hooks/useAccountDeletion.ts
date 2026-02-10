import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@icp-sdk/core/principal';

/**
 * Hook to request account deletion for the current user.
 * Records a deletion request that admins can process.
 */
export function useRequestDeletion() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Identity not available');
      return actor.requestDeletion();
    },
    onSuccess: () => {
      // Invalidate deletion requests list for admin view
      queryClient.invalidateQueries({ queryKey: ['deletionRequests'] });
    },
  });
}

/**
 * Hook to process a deletion request (admin only).
 * Deletes the user's profile and removes the deletion request.
 */
export function useProcessDeletionRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.processDeletionRequest(userPrincipal);
    },
    onSuccess: () => {
      // Invalidate deletion requests list to refresh the admin view
      queryClient.invalidateQueries({ queryKey: ['deletionRequests'] });
    },
  });
}
