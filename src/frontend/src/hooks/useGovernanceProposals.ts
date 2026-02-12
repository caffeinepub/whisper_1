import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { getUserFacingError } from '@/utils/userFacingError';
import type { GovernanceProposal } from '@/backend';

/**
 * React Query hooks for governance proposals: list, get details, create, and vote.
 * Enforces identity/actor availability for authenticated actions.
 */

export function useGovernanceListProposals() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<GovernanceProposal[]>({
    queryKey: ['governanceProposals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.governanceListProposals();
      } catch (error: any) {
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGovernanceGetProposal(proposalId: bigint | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<GovernanceProposal | null>({
    queryKey: ['governanceProposal', proposalId?.toString()],
    queryFn: async () => {
      if (!actor || proposalId === null) return null;
      try {
        return await actor.governanceGetProposal(proposalId);
      } catch (error: any) {
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && !!identity && proposalId !== null,
  });
}

export function useGovernanceCreateProposal() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Authentication required');

      const result = await actor.governanceCreateProposal(title, description);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governanceProposals'] });
    },
    onError: (error: any) => {
      throw new Error(getUserFacingError(error));
    },
  });
}

export function useGovernanceVote() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, approve }: { proposalId: bigint; approve: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Authentication required');

      const result = await actor.governanceVote(proposalId, approve);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific proposal
      queryClient.invalidateQueries({ queryKey: ['governanceProposals'] });
      queryClient.invalidateQueries({ queryKey: ['governanceProposal', variables.proposalId.toString()] });
    },
    onError: (error: any) => {
      throw new Error(getUserFacingError(error));
    },
  });
}
