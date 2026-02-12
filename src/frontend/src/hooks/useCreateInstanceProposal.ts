import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { USHierarchyLevel } from '@/backend';
import { useLocalStorageState } from './useLocalStorageState';
import { userFacingError } from '@/utils/userFacingError';
import { useContributionEventLogger } from './useContributionEventLogger';
import { CONTRIBUTION_ACTION_TYPES } from '@/lib/contributionActionTypes';

/**
 * Hook to check if an instance name is already taken.
 * Returns true if taken, false if available.
 * Throws user-friendly error if check fails to prevent submission with unknown state.
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
        const errorMessage = userFacingError(error);
        console.error('Error checking instance name:', error);
        // Throw user-friendly error to prevent submission when we can't verify availability
        throw new Error(errorMessage);
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

interface SubmissionSuccess {
  instanceName: string;
}

/**
 * Hook to submit a new instance proposal.
 * Validates all required geography fields before submission.
 * Logs contribution event after successful submission.
 * Invalidates proposals cache on success to ensure fresh data.
 */
export function useSubmitProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const logContribution = useContributionEventLogger();

  return useMutation<SubmissionSuccess, Error, SubmitProposalParams>({
    mutationFn: async (params) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please try again.');
      }

      // Frontend validation: Ensure all required geography fields are non-empty
      if (!params.state || params.state.trim().length === 0) {
        throw new Error('State is required. Please select a state.');
      }
      if (!params.county || params.county.trim().length === 0) {
        throw new Error('County is required. Please select a county.');
      }
      if (!params.censusBoundaryId || params.censusBoundaryId.trim().length === 0) {
        throw new Error('Census boundary ID is required. Please complete your geography selection.');
      }
      if (!params.population2020 || params.population2020.trim().length === 0) {
        throw new Error('Population data is required. Please complete your geography selection.');
      }
      if (params.squareMeters === BigInt(0)) {
        throw new Error('Area data is required. Please complete your geography selection.');
      }

      try {
        const result = await actor.submitProposal(
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

        if (result.__kind__ === 'error') {
          throw new Error(result.error.message);
        }

        return { instanceName: params.instanceName };
      } catch (error) {
        const errorMessage = userFacingError(error);
        console.error('Error submitting proposal:', error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: async (data) => {
      // Invalidate proposals list to fetch fresh data including the new proposal
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      // Also invalidate the specific proposal query for the newly created proposal
      queryClient.invalidateQueries({ queryKey: ['proposal', data.instanceName] });

      // Log contribution event after successful issue creation
      // Use instanceName as stable referenceId
      try {
        await logContribution.mutateAsync({
          actionType: CONTRIBUTION_ACTION_TYPES.ISSUE_CREATED,
          referenceId: data.instanceName,
          details: 'Issue proposal created',
        });
      } catch (error) {
        // Don't break the success flow if contribution logging fails
        console.warn('Failed to log contribution for issue creation:', error);
      }
    },
  });
}
