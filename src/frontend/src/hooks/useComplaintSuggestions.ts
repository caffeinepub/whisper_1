import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { USHierarchyLevel } from '@/backend';

export function useComplaintSuggestions(
  level: USHierarchyLevel | null,
  searchTerm: string,
  enabled: boolean = true
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['complaintSuggestions', level, searchTerm],
    queryFn: async () => {
      if (!actor || !level) return [];

      const term = searchTerm.trim();

      // Use the new unified backend method
      return actor.getSecretaryCategorySuggestions(term, level);
    },
    enabled: !!actor && !actorFetching && !!level && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGetAllComplaintCategories(level: USHierarchyLevel | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['allComplaintCategories', level],
    queryFn: async () => {
      if (!actor || !level) return [];

      switch (level) {
        case 'place':
          return actor.getAllCityComplaintCategories();
        case 'county':
          return actor.getAllCountyComplaintCategories();
        case 'state':
          return actor.getAllStateComplaintCategories();
        default:
          return [];
      }
    },
    enabled: !!actor && !actorFetching && !!level,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
