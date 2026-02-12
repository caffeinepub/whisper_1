import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { USHierarchyLevel } from '@/backend';
import { getUserFacingError } from '@/utils/userFacingError';

export function useComplaintSuggestions(
  level: USHierarchyLevel | null,
  searchTerm: string,
  enabled: boolean = true
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['complaintSuggestions', level, searchTerm],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!level) return [];
      
      try {
        // Call backend with search term
        const results = await actor.getComplaintCategoriesByGeographyLevel(level, searchTerm || null);
        return results;
      } catch (error) {
        console.error('Failed to fetch complaint suggestions:', error);
        throw new Error(getUserFacingError(error));
      }
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
      if (!actor) throw new Error('Actor not available');
      if (!level) return [];
      
      try {
        // Call backend without search term to get all categories
        const results = await actor.getComplaintCategoriesByGeographyLevel(level, null);
        return results;
      } catch (error) {
        console.error('Failed to fetch all complaint categories:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !actorFetching && !!level,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
