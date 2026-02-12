import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { StakingRecord } from '@/backend';

/**
 * React Query hook for fetching the caller's staking information.
 * Uses identity-scoped query key to prevent cross-user cache leaks.
 */
export function useStakingInfo() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  const query = useQuery<StakingRecord | null>({
    queryKey: ['stakingInfo', principal],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStakingInfo();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
