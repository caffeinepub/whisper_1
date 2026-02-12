import { useInfiniteQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Post } from '@/backend';
import { getUserFacingError } from '@/utils/userFacingError';

const PAGE_SIZE = 20;

export function useInstanceFeed(instanceName: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useInfiniteQuery<Post[], Error>({
    queryKey: ['feed', instanceName],
    queryFn: async ({ pageParam = 0 }) => {
      if (!actor) return [];
      try {
        const posts = await actor.getPostsByInstance(
          instanceName,
          BigInt(PAGE_SIZE),
          BigInt(pageParam as number)
        );
        return posts;
      } catch (error) {
        console.error('Error fetching feed:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than PAGE_SIZE, we've reached the end
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      // Calculate the next offset
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    enabled: !!actor && !actorFetching && !!instanceName,
  });
}
