import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '@/backend';
import type { Principal } from '@icp-sdk/core/principal';
import { getUserFacingError } from '@/utils/userFacingError';

export function useUserProfileByPrincipal(principal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        return await actor.getUserProfile(principal);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Return null instead of throwing to allow graceful fallback
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
