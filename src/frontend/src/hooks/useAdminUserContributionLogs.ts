import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ContributionLogEntry } from '@/backend';
import { Principal } from '@dfinity/principal';

/**
 * React Query hook to fetch contribution logs for a specific user principal.
 * Admin-only capability with explicit admin flag to prevent unauthorized fetches.
 */
export function useAdminUserContributionLogs(userPrincipal: string | null, limit: number = 100, isAdmin: boolean = false) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ContributionLogEntry[]>({
    queryKey: ['adminUserContributionLogs', userPrincipal, limit],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!userPrincipal) throw new Error('User principal is required');
      
      const principal = Principal.fromText(userPrincipal);
      const result = await actor.adminGetUserContributionLogs(principal, BigInt(limit));
      return result;
    },
    enabled: !!actor && !actorFetching && !!userPrincipal && isAdmin,
    retry: 1,
  });
}
