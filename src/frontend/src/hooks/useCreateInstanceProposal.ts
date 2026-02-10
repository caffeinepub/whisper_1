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
 * Hook to submit a new instance creation proposal with full geography metadata and required field validation.
 * On success, persists the submission metadata to localStorage and invalidates relevant queries.
 */
export function useSubmitProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [, setLastSubmission] = useLocalStorageState<SubmissionSuccess | null>('whisper-last-submission', null);

  return useMutation({
    mutationFn: async (params: SubmitProposalParams) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please try again.');
      }

      // Frontend validation: ensure all required geography fields are present
      if (!params.state || params.state.trim().length === 0) {
        throw new Error('State is required. Please select a state.');
      }

      if (!params.county || params.county.trim().length === 0) {
        throw new Error('County is required. Please select a county.');
      }

      if (!params.censusBoundaryId || params.censusBoundaryId.trim().length === 0) {
        throw new Error('Census boundary ID is required. Please ensure a valid geography selection.');
      }

      if (!params.population2020 || params.population2020.trim().length === 0) {
        throw new Error('Population data is required. Please ensure a valid geography selection.');
      }

      if (params.squareMeters === BigInt(0)) {
        throw new Error('Area data is required. Please ensure a valid geography selection.');
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

        return result.success.proposal;
      } catch (error) {
        const { userMessage, originalError } = getUserFacingError(error);
        console.error('Error submitting proposal:', originalError);
        throw new Error(userMessage);
      }
    },
    onSuccess: (proposal, params) => {
      // Invalidate proposals list to show the new proposal
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      
      // Invalidate the specific instance name check
      queryClient.invalidateQueries({ queryKey: ['instanceNameCheck', params.instanceName] });

      // Store submission metadata in localStorage
      setLastSubmission({
        instanceName: params.instanceName,
        timestamp: Date.now(),
        state: params.state,
        county: params.county,
        geographyLevel: params.geographyLevel,
      });
    },
  });
}
