import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { USHierarchyLevel } from '@/backend';
import { useLocalStorageState } from './useLocalStorageState';
import { getUserFacingError } from '@/utils/userFacingError';

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
        const { userMessage, originalError } = getUserFacingError(error);
        console.error('Error checking instance name:', originalError);
        // Throw user-friendly error to prevent submission when we can't verify availability
        throw new Error(userMessage);
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
  timestamp: number;
  state: string;
  county?: string;
  geographyLevel: string;
}

/**
 * Hook to submit a new instance creation proposal with full geography metadata.
 * On success, persists the submission metadata to localStorage.
 * Provides user-friendly error messages while logging technical details.
 */
export function useSubmitProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [, setLastSubmission] = useLocalStorageState<SubmissionSuccess | null>(
    'whisper-last-proposal-submission',
    null
  );

  return useMutation({
    mutationFn: async (params: SubmitProposalParams) => {
      if (!actor) {
        throw new Error('Backend connection not available');
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

        // Handle discriminated union result
        if (result.__kind__ === 'error') {
          throw new Error(result.error.message);
        }

        // Return the proposal from the success result
        return {
          proposal: result.success.proposal,
          params,
        };
      } catch (error) {
        const { userMessage, originalError } = getUserFacingError(error);
        console.error('Error submitting proposal:', originalError);
        throw new Error(userMessage);
      }
    },
    onSuccess: (data) => {
      // Persist submission metadata to localStorage
      const submissionRecord: SubmissionSuccess = {
        instanceName: data.params.instanceName,
        timestamp: Date.now(),
        state: data.params.state,
        county: data.params.county || undefined,
        geographyLevel: data.params.geographyLevel,
      };
      setLastSubmission(submissionRecord);

      // Invalidate queries to refresh the proposals list
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['instanceNameCheck', data.params.instanceName] });
    },
  });
}
