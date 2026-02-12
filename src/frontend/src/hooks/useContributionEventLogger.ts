import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { userFacingError } from '@/utils/userFacingError';

interface LogContributionEventParams {
  actionType: string;
  referenceId?: string | null;
  details?: string | null;
}

/**
 * React hook that wraps actor.logContributionEvent with:
 * - Actor availability checks
 * - Idempotent duplicate response handling (does not break UI)
 * - Shared error normalization
 * - Automatic invalidation of contribution summary cache
 * 
 * Used by issue-flow actions (issue creation, comment creation, evidence upload).
 */
export function useContributionEventLogger() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ actionType, referenceId, details }: LogContributionEventParams) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }

      try {
        const entryId = await actor.logContributionEvent(
          actionType,
          referenceId || null,
          details || null
        );
        return { entryId, isDuplicate: false };
      } catch (error: any) {
        // Check if this is a duplicate contribution error
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('Duplicate contribution')) {
          // Tolerate duplicate - don't break the UI flow
          console.log('Duplicate contribution detected (already awarded):', actionType, referenceId);
          return { entryId: null, isDuplicate: true };
        }
        
        // For other errors, normalize and throw
        const friendlyError = userFacingError(error);
        throw new Error(friendlyError);
      }
    },
    onSuccess: (result) => {
      // Invalidate contribution summary cache on success or tolerated duplicate
      // This ensures the profile page shows updated totals
      queryClient.invalidateQueries({ queryKey: ['callerContributionSummary'] });
      
      if (!result.isDuplicate) {
        console.log('Contribution event logged successfully:', result.entryId);
      }
    },
    // Don't show error toasts - let the calling code decide how to handle errors
    onError: (error) => {
      console.error('Failed to log contribution event:', error);
    },
  });
}
