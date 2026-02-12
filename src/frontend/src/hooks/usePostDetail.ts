import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Post } from '@/backend';
import { getUserFacingError } from '@/utils/userFacingError';

export function usePostDetail(postId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Post | null>({
    queryKey: ['post', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return null;
      try {
        return await actor.getPost(postId);
      } catch (error) {
        console.error('Error fetching post:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && postId !== null,
  });
}
