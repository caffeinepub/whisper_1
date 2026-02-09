import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { USHierarchyLevel } from '@/backend';

/**
 * Hook to check if an instance name is already taken.
 * Returns true if taken, false if available.
 * Throws error if check fails to prevent submission with unknown state.
 */
export function useCheckInstanceName(instanceName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['instanceNameCheck', instanceName],
    queryFn: async () => {
      if (!actor || !instanceName) return false;
      try {
        const result = await actor.isInstanceNameTaken(instanceName);
        return result;
      } catch (error) {
        console.error('Error checking instance name:', error);
        // Throw error instead of returning false to prevent submission
        // when we can't verify availability
        throw new Error('Unable to verify name availability');
      }
    },
    enabled: !!actor && !isFetching && !!instanceName && instanceName.length > 0,
    staleTime: 1000 * 10, // Cache for 10 seconds
    retry: 1, // Only retry once for availability checks
  });
}

interface SubmitProposalParams {
  description: string;
  instanceName: string;
  status: string;
  state: string;
  county: string;
  geographyLevel: USHierarchyLevel;
  censusBoundaryId: string;
  squareMeters: bigint;
  population2020: string;
}

/**
 * Hook to submit a new instance creation proposal with full geography metadata.
 */
export function useSubmitProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitProposalParams) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }

      const success = await actor.submitProposal(
        params.description,
        params.instanceName,
        params.status,
        params.state,
        params.county,
        params.geographyLevel,
        params.censusBoundaryId,
        params.squareMeters,
        params.population2020
      );

      if (!success) {
        throw new Error('Instance name is already taken or proposal submission failed');
      }

      return success;
    },
    onSuccess: () => {
      // Invalidate proposals list to show the new proposal
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      // Invalidate name checks to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['instanceNameCheck'] });
    },
  });
}
