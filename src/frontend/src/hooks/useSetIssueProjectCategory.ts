import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useSetIssueProjectCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, category }: { proposalId: string; category: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // For now, we'll store the category in a way that's compatible with the current backend
      // The backend doesn't have setIssueProjectCategory yet, so we'll use a workaround
      // by storing it in localStorage and displaying it client-side only
      // This is a temporary solution until the backend method is added
      
      // Store in localStorage as a temporary solution
      const storageKey = `issue-project-category-${proposalId}`;
      localStorage.setItem(storageKey, category);
      
      return true;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['proposal', variables.proposalId] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useGetIssueProjectCategory(proposalId: string | null) {
  // Temporary client-side storage solution
  if (!proposalId) return null;
  
  const storageKey = `issue-project-category-${proposalId}`;
  return localStorage.getItem(storageKey);
}
