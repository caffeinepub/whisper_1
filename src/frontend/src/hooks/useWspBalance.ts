import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

/**
 * React Query hook to fetch the caller's WSP token balance from the backend ledger.
 * Uses identity-scoped query keys to prevent cross-user cache leakage.
 */
export function useWspBalance() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();

  const query = useQuery<bigint>({
    queryKey: ['wspBalance', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) throw new Error('Actor or identity not available');
      return actor.icrc1_balance_of(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
    retry: 1,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!principal && query.isFetched,
  };
}
