import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { USState, USCounty, USPlace, GeoId } from '@/backend';

/**
 * Hook to fetch all U.S. states from the backend.
 * Returns an empty array while loading to prevent undefined states.
 */
export function useGetAllStates() {
  const { actor, isFetching } = useActor();

  return useQuery<USState[]>({
    queryKey: ['geography', 'states'],
    queryFn: async () => {
      if (!actor) {
        return [];
      }
      try {
        const result = await actor.getAllStates();
        return result;
      } catch (error) {
        console.error('Error fetching states:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: 1000 * 60 * 60, // States data is stable, cache for 1 hour
    initialData: [], // Provide stable empty array during loading
  });
}

/**
 * Hook to fetch counties for a specific state.
 * Only enabled when a valid stateGeoId is provided.
 * Returns empty array instead of throwing when no counties found.
 */
export function useGetCountiesForState(stateGeoId: GeoId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USCounty[]>({
    queryKey: ['geography', 'counties', stateGeoId],
    queryFn: async () => {
      if (!actor || !stateGeoId) {
        return [];
      }
      try {
        const result = await actor.getCountiesForState(stateGeoId);
        return result;
      } catch (error) {
        // Check if this is a "no counties found" error from backend
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('No counties found')) {
          // Return empty array for legitimate empty results
          return [];
        }
        // Return empty array for other errors to prevent console noise
        console.error('Error fetching counties:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!stateGeoId,
    retry: 1, // Only retry once since empty results are valid
    staleTime: 1000 * 60 * 30, // Counties data is stable, cache for 30 minutes
    initialData: [], // Provide stable empty array during loading
  });
}

/**
 * Hook to fetch places (cities/towns) for a specific county.
 * Only enabled when a valid countyGeoId is provided.
 * Returns empty array instead of throwing when no places found.
 */
export function useGetPlacesForCounty(countyGeoId: GeoId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USPlace[]>({
    queryKey: ['geography', 'places', countyGeoId],
    queryFn: async () => {
      if (!actor || !countyGeoId) {
        return [];
      }
      try {
        const result = await actor.getPlacesForCounty(countyGeoId);
        return result;
      } catch (error) {
        // Check if this is a "no places found" error from backend
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('No places found')) {
          // Return empty array for legitimate empty results
          return [];
        }
        // Return empty array for other errors to prevent console noise
        console.error('Error fetching places:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!countyGeoId,
    retry: 1, // Only retry once since empty results are valid
    staleTime: 1000 * 60 * 30, // Places data is stable, cache for 30 minutes
    initialData: [], // Provide stable empty array during loading
  });
}

/**
 * Hook to fetch places (cities/towns) for a specific state.
 * Only enabled when a valid stateGeoId is provided.
 * Returns empty array instead of throwing when no places found.
 */
export function useGetPlacesForState(stateGeoId: GeoId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USPlace[]>({
    queryKey: ['geography', 'places-by-state', stateGeoId],
    queryFn: async () => {
      if (!actor || !stateGeoId) {
        return [];
      }
      try {
        const result = await actor.getPlacesForState(stateGeoId);
        return result;
      } catch (error) {
        // Check if this is a "no places found" error from backend
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('No places found')) {
          // Return empty array for legitimate empty results
          return [];
        }
        // Return empty array for other errors to prevent console noise
        console.error('Error fetching places:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!stateGeoId,
    retry: 1, // Only retry once since empty results are valid
    staleTime: 1000 * 60 * 30, // Places data is stable, cache for 30 minutes
    initialData: [], // Provide stable empty array during loading
  });
}

/**
 * Hook to fetch a specific state by ID.
 * Backend method not yet implemented - returns null.
 */
export function useGetStateById(stateId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USState | null>({
    queryKey: ['geography', 'state', stateId],
    queryFn: async () => {
      // Backend method not yet implemented - return null
      return null;
    },
    enabled: !!actor && !isFetching && !!stateId,
    retry: 1,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Hook to fetch a specific county by ID.
 * Backend method not yet implemented - returns null.
 */
export function useGetCountyById(countyId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USCounty | null>({
    queryKey: ['geography', 'county', countyId],
    queryFn: async () => {
      // Backend method not yet implemented - return null
      return null;
    },
    enabled: !!actor && !isFetching && !!countyId,
    retry: 1,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Hook to fetch a specific city/place by ID.
 * Backend method not yet implemented - returns null.
 */
export function useGetCityById(cityId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USPlace | null>({
    queryKey: ['geography', 'city', cityId],
    queryFn: async () => {
      // Backend method not yet implemented - return null
      return null;
    },
    enabled: !!actor && !isFetching && !!cityId,
    retry: 1,
    staleTime: 1000 * 60 * 30,
  });
}
