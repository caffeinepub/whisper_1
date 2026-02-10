import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { generateWhisperInstanceName } from '@/lib/whisperInstanceNaming';
import { USHierarchyLevel, type USState, type USCounty, type USPlace } from '@/backend';

interface InstanceAvailabilityParams {
  level: USHierarchyLevel;
  state: USState | null;
  county?: USCounty | null;
  place?: USPlace | null;
}

/**
 * Hook to check if a Whisper instance exists for a given geography selection.
 * Uses the backend isInstanceNameTaken method to determine availability.
 */
export function useSecretaryInstanceAvailability(params: InstanceAvailabilityParams | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['secretary', 'instance-availability', params?.level, params?.state?.hierarchicalId, params?.county?.hierarchicalId, params?.place?.hierarchicalId],
    queryFn: async () => {
      if (!actor || !params || !params.state) {
        return false;
      }

      try {
        // Generate the canonical instance name
        const instanceName = generateWhisperInstanceName(
          params.level,
          params.state.longName,
          params.county?.fullName,
          params.place?.shortName
        );

        // Check if instance exists via backend
        const isTaken = await actor.isInstanceNameTaken(instanceName);
        return isTaken;
      } catch (error) {
        console.error('Error checking instance availability:', error);
        // Return false on error to avoid blocking the UI
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!params && !!params.state,
    retry: 1,
    staleTime: 1000 * 30, // Cache for 30 seconds
  });
}

/**
 * Hook to check multiple instance levels at once (state, county, place).
 * Returns availability status for each level.
 */
export function useSecretaryMultiLevelAvailability(
  state: USState | null,
  county: USCounty | null,
  place: USPlace | null
) {
  const stateAvailability = useSecretaryInstanceAvailability(
    state ? { level: USHierarchyLevel.state, state } : null
  );

  const countyAvailability = useSecretaryInstanceAvailability(
    state && county ? { level: USHierarchyLevel.county, state, county } : null
  );

  const placeAvailability = useSecretaryInstanceAvailability(
    state && place ? { level: USHierarchyLevel.place, state, place } : null
  );

  return {
    state: {
      exists: stateAvailability.data ?? false,
      isLoading: stateAvailability.isLoading,
      isError: stateAvailability.isError,
    },
    county: {
      exists: countyAvailability.data ?? false,
      isLoading: countyAvailability.isLoading,
      isError: countyAvailability.isError,
    },
    place: {
      exists: placeAvailability.data ?? false,
      isLoading: placeAvailability.isLoading,
      isError: placeAvailability.isError,
    },
    isAnyLoading: stateAvailability.isLoading || countyAvailability.isLoading || placeAvailability.isLoading,
  };
}
