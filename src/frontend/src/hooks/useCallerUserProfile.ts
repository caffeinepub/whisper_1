import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile } from '@/backend';

/**
 * Hook to fetch the current caller's user profile.
 * Prevents profile setup modal flash by properly tracking actor and identity state.
 * Scopes query key to current principal to prevent cross-user cache leakage.
 */
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalString = identity?.getPrincipal().toString() || 'anonymous';

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', principalString],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
  });

  // Return custom state that properly reflects actor and identity dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

/**
 * Hook to save the current caller's user profile.
 * Supports saving both name and optional profile image.
 * Invalidates identity-scoped cache after save.
 */
export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Identity not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      // Invalidate and refetch the profile query to show updated data
      const principalString = identity?.getPrincipal().toString() || 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', principalString] });
    },
  });
}
