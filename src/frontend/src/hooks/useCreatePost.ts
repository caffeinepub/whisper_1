import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { CreatePostRequest, Post } from '@/backend';
import { getUserFacingError } from '@/utils/userFacingError';
import { toast } from 'sonner';

export function useCreatePost() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreatePostRequest) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to create a post');

      const result = await actor.createPost(request);
      
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      
      return result.ok;
    },
    onSuccess: (post: Post, variables) => {
      // Invalidate all posts queries for this instance
      queryClient.invalidateQueries({ queryKey: ['posts', variables.instanceName] });
      
      toast.success('Post created successfully');
    },
    onError: (error: any) => {
      const message = getUserFacingError(error);
      toast.error(message);
    },
  });
}
