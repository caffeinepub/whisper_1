import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { getUserFacingError } from '@/utils/userFacingError';

/**
 * React Query mutation hooks for staking write actions (stake and unstake).
 * Invalidates staking info and WSP balance queries on success.
 */

export function useStake() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principal = identity?.getPrincipal().toString();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.stake(amount);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate staking info query
      queryClient.invalidateQueries({ queryKey: ['stakingRecord', principal] });
      // Invalidate WSP balance query
      queryClient.invalidateQueries({ queryKey: ['wspBalance', principal] });
    },
    onError: (error: any) => {
      throw new Error(getUserFacingError(error));
    },
  });
}

export function useUnstake() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principal = identity?.getPrincipal().toString();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.unstake(amount);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate staking info query
      queryClient.invalidateQueries({ queryKey: ['stakingRecord', principal] });
      // Invalidate WSP balance query
      queryClient.invalidateQueries({ queryKey: ['wspBalance', principal] });
    },
    onError: (error: any) => {
      throw new Error(getUserFacingError(error));
    },
  });
}
