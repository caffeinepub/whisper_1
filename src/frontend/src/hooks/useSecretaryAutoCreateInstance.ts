import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { generateWhisperInstanceName } from '@/lib/whisperInstanceNaming';
import { getUserFacingError } from '@/utils/userFacingError';
import type { USHierarchyLevel, USState, USCounty, USPlace } from '@/backend';

interface AutoCreateParams {
  level: USHierarchyLevel;
  state: USState;
  county?: USCounty | null;
  place?: USPlace | null;
  description?: string;
}

interface AutoCreateResult {
  instanceName: string;
  success: boolean;
}

/**
 * Secretary-focused hook that automatically creates a Whisper instance proposal
 * using the canonical naming format based on geography selection.
 * Returns user-friendly success/error states for the Secretary UI.
 */
export function useSecretaryAutoCreateInstance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<AutoCreateResult, Error, AutoCreateParams>({
    mutationFn: async (params) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please try again.');
      }

      // Compute canonical instance name
      const instanceName = generateWhisperInstanceName(
        params.level,
        params.state.longName,
        params.county?.fullName,
        params.place?.shortName
      );

      // Prepare geography data based on level
      let censusBoundaryId: string;
      let squareMeters: bigint;
      let population2020: string;
      let countyName: string;

      if (params.place) {
        censusBoundaryId = params.place.censusCensusFipsCode;
        squareMeters = BigInt(Number(params.place.censusLandKm2) * 1_000_000);
        population2020 = params.place.population ? params.place.population.toString() : '0';
        countyName = params.place.countyFullName;
      } else if (params.county) {
        censusBoundaryId = params.county.fipsCode;
        squareMeters = BigInt(params.county.censusLandAreaSqMeters);
        population2020 = params.county.population2010;
        countyName = params.county.fullName;
      } else {
        // State level
        censusBoundaryId = params.state.fipsCode;
        squareMeters = params.state.censusLandAreaSqMeters;
        population2020 = '0';
        countyName = 'N/A';
      }

      const description = params.description || `Whisper instance for ${params.state.longName}`;

      try {
        const result = await actor.submitProposal(
          description,
          instanceName,
          'Pending',
          params.state.longName,
          countyName,
          params.level,
          censusBoundaryId,
          squareMeters,
          population2020
        );

        if (result.__kind__ === 'error') {
          throw new Error(result.error.message);
        }

        return { instanceName, success: true };
      } catch (error) {
        const { userMessage, originalError } = getUserFacingError(error);
        console.error('Error auto-creating instance:', originalError);
        throw new Error(userMessage);
      }
    },
    onSuccess: (data) => {
      // Invalidate proposals list and instance availability checks
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', data.instanceName] });
      queryClient.invalidateQueries({ queryKey: ['secretary', 'instance-availability'] });
    },
  });
}
