import { toast } from 'sonner';
import { CONTRIBUTION_ACTION_TYPES } from './contributionActionTypes';

// Module-level lock to prevent duplicate toasts
let lastToastTime = 0;
const TOAST_LOCK_WINDOW_MS = 1000; // 1 second window

export type ToastOrigin = 'standard' | 'chat';

interface EarnedPointsToastOptions {
  pointsAwarded: number;
  actionType: string;
  origin?: ToastOrigin;
  queryClient?: any; // Optional React Query client for reading cached totals
}

/**
 * Shared earned-points toast helper for contribution logging success.
 * Features:
 * - Action-type-specific English phrasing
 * - Secretary-friendly variants for chat origin
 * - Auto-dismiss after 2.5 seconds
 * - Centralized lock to prevent duplicate toasts
 * - Optionally displays updated total points from React Query cache
 */
export function showEarnedPointsToast({
  pointsAwarded,
  actionType,
  origin = 'standard',
  queryClient,
}: EarnedPointsToastOptions): void {
  // Lock check: prevent rapid successive toasts
  const now = Date.now();
  if (now - lastToastTime < TOAST_LOCK_WINDOW_MS) {
    console.log('Toast lock active: skipping duplicate earned-points toast');
    return;
  }
  lastToastTime = now;

  // Get action-specific copy
  const copy = getToastCopy(actionType, origin);

  // Try to read updated total from React Query cache (no backend fetch)
  let totalPointsLine: string | undefined;
  if (queryClient) {
    try {
      // Find the first matching query for callerContributionSummary (identity-scoped)
      const queries = queryClient.getQueriesData({ queryKey: ['callerContributionSummary'] });
      if (queries && queries.length > 0) {
        const [, cachedData] = queries[0];
        if (cachedData && typeof cachedData === 'object' && 'totalPoints' in cachedData) {
          const totalPoints = Number(cachedData.totalPoints);
          if (!isNaN(totalPoints) && totalPoints > 0) {
            totalPointsLine = `Total: ${totalPoints} points`;
          }
        }
      }
    } catch (error) {
      // Silently ignore cache read errors
      console.debug('Could not read contribution summary from cache:', error);
    }
  }

  // Build description
  const description = totalPointsLine
    ? `${copy.description}\n${totalPointsLine}`
    : copy.description;

  // Show toast with 2.5s auto-dismiss (icon will be added by Sonner's success variant)
  toast.success(copy.title, {
    description,
    duration: 2500,
  });
}

interface ToastCopy {
  title: string;
  description: string;
}

/**
 * Get action-type-specific toast copy with origin variants
 */
function getToastCopy(actionType: string, origin: ToastOrigin): ToastCopy {
  const isChat = origin === 'chat';

  switch (actionType) {
    case CONTRIBUTION_ACTION_TYPES.ISSUE_CREATED:
      return {
        title: '+10 contribution points earned',
        description: isChat
          ? 'Your issue proposal has been submitted via the assistant.'
          : 'Your issue proposal has been submitted successfully.',
      };

    case CONTRIBUTION_ACTION_TYPES.COMMENT_CREATED:
      return {
        title: '+5 contribution points earned',
        description: isChat
          ? 'Your comment has been added via the assistant.'
          : 'Your comment has been added to the project.',
      };

    case CONTRIBUTION_ACTION_TYPES.EVIDENCE_ADDED:
      return {
        title: '+20 contribution points earned',
        description: isChat
          ? 'Your evidence has been uploaded via the assistant.'
          : 'Your evidence has been uploaded successfully.',
      };

    default:
      // Fallback for unknown action types
      return {
        title: `+${10} contribution points earned`,
        description: isChat
          ? 'Your contribution has been recorded via the assistant.'
          : 'Your contribution has been recorded.',
      };
  }
}
