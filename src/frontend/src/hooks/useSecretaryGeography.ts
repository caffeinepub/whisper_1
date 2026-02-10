import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { USState, USCounty, USPlace, HierarchicalGeoId, USHierarchyLevel } from '@/backend';

/**
 * Hook to fetch a specific state by its hierarchical ID.
 * Secretary-specific endpoint for retrieving individual geography records.
 */
export function useGetStateById(hierarchicalId: HierarchicalGeoId | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<USState | null>({
    queryKey: ['secretary', 'state', hierarchicalId],
    queryFn: async () => {
      if (!actor || !hierarchicalId) {
        return null;
      }
      try {
        const result = await actor.getStateById(hierarchicalId);
        return result;
      } catch (error) {
        console.error('Error fetching state by ID:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!hierarchicalId,
    retry: 1,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

/**
 * Hook to fetch a specific county by its hierarchical ID.
 * Secretary-specific endpoint for retrieving individual geography records.
 */
export function useGetCountyById(hierarchicalId: HierarchicalGeoId | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<USCounty | null>({
    queryKey: ['secretary', 'county', hierarchicalId],
    queryFn: async () => {
      if (!actor || !hierarchicalId) {
        return null;
      }
      try {
        const result = await actor.getCountyById(hierarchicalId);
        return result;
      } catch (error) {
        console.error('Error fetching county by ID:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!hierarchicalId,
    retry: 1,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

/**
 * Hook to fetch a specific city/place by its hierarchical ID.
 * Secretary-specific endpoint for retrieving individual geography records.
 */
export function useGetCityById(hierarchicalId: HierarchicalGeoId | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<USPlace | null>({
    queryKey: ['secretary', 'city', hierarchicalId],
    queryFn: async () => {
      if (!actor || !hierarchicalId) {
        return null;
      }
      try {
        const result = await actor.getCityById(hierarchicalId);
        return result;
      } catch (error) {
        console.error('Error fetching city by ID:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!hierarchicalId,
    retry: 1,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

/**
 * Hook to fetch top 50 issues for a specific location.
 * Secretary-specific endpoint for retrieving common civic issues/complaints.
 */
export function useGetTop50IssuesForLocation(
  level: USHierarchyLevel | null,
  hierarchicalId: HierarchicalGeoId | null
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['secretary', 'top-issues', level, hierarchicalId],
    queryFn: async () => {
      if (!actor || !level) {
        return [];
      }
      try {
        const result = await actor.getTop50IssuesForLocation(level, hierarchicalId);
        return result;
      } catch (error) {
        console.error('Error fetching top issues:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!level,
    retry: 1,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

/**
 * Hook to search for cities with similar names.
 * Secretary-specific endpoint for typeahead/autocomplete functionality.
 */
export function useSearchSimilarCityNames(searchTerm: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<USPlace[]>({
    queryKey: ['secretary', 'search-cities', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm || searchTerm.trim().length < 3) {
        return [];
      }
      try {
        const result = await actor.searchSimilarCityNames(searchTerm.trim());
        return result;
      } catch (error) {
        console.error('Error searching cities:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!searchTerm && searchTerm.trim().length >= 3,
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
