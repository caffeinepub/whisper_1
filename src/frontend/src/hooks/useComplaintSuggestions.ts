import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { USHierarchyLevel } from '@/backend';

export function useComplaintSuggestions(
  level: USHierarchyLevel | null,
  searchTerm: string,
  enabled: boolean = true
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['complaintSuggestions', level, searchTerm],
    queryFn: async () => {
      // Backend method not yet implemented - return empty array
      return [];
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
      // Backend methods not yet implemented - return empty array
      return [];
    },
    enabled: !!actor && !actorFetching && !!level,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
