import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { getUserFacingError } from '@/utils/userFacingError';
import { toast } from 'sonner';

export function useFlagPost() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, reason }: { postId: bigint; reason: string }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to flag a post');

      const result = await actor.flagPost(postId, reason);
      
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      
      return result.ok;
    },
    onSuccess: () => {
      // Invalidate all feed queries to refresh posts
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      
      toast.success('Post flagged successfully');
    },
    onError: (error: any) => {
      const message = getUserFacingError(error);
      toast.error(message);
    },
  });
}
