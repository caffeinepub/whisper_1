import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ContributionLogEntry } from '@/backend';
import { Principal } from '@dfinity/principal';

/**
 * React Query hook for fetching admin contribution logs with pagination.
 * Only accessible to admin users; returns bounded list of contribution entries.
 */
export function useAdminContributionLogs(offset: number = 0, limit: number = 20) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, ContributionLogEntry[]]>>({
    queryKey: ['adminContributionLogs', offset, limit],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.adminGetContributionLogs(BigInt(offset), BigInt(limit));
      return result;
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}
