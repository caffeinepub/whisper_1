import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { ContributionSummary } from '@/backend';

/**
 * React Query hook that loads the caller's contribution summary from the backend.
 * Exposes loading/error/data states for the Profile page with safe empty/zero states.
 */
export function useCallerContributionSummary() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ContributionSummary | null>({
    queryKey: ['callerContributionSummary', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const summary = await actor.getCallerContributionSummary();
      return summary;
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 1,
  });
}
