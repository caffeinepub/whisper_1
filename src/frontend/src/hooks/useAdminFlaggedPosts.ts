import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Post } from '@/backend';
import { getUserFacingError } from '@/utils/userFacingError';
import { toast } from 'sonner';

export function useAdminFlaggedPosts(limit: number = 50, offset: number = 0, isAdmin: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['adminFlaggedPosts', limit, offset],
    queryFn: async () => {
      if (!actor || !isAdmin) return [];
      try {
        return await actor.getFlaggedPosts(BigInt(limit), BigInt(offset));
      } catch (error) {
        console.error('Error fetching flagged posts:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

export function useClearFlag() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');

      const result = await actor.clearFlag(postId);
      
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFlaggedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      toast.success('Flag cleared successfully');
    },
    onError: (error: any) => {
      const message = getUserFacingError(error);
      toast.error(message);
    },
  });
}

export function useDeleteFlaggedPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');

      const result = await actor.deletePost(postId);
      
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFlaggedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      toast.success('Post deleted successfully');
    },
    onError: (error: any) => {
      const message = getUserFacingError(error);
      toast.error(message);
    },
  });
}
