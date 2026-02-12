import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { userFacingError } from '@/utils/userFacingError';
import { CONTRIBUTION_ACTION_TYPES } from '@/lib/contributionActionTypes';

interface LogContributionEventParams {
  actionType: string;
  referenceId?: string | null;
  details?: string | null;
}

export interface ContributionLogResult {
  pointsAwarded: number;
  rewardType: string;
  isDuplicate: boolean;
  actionType: string;
  referenceId: string | null;
}

// Module-level dedupe registry (shared across all hook instances)
const inFlightRegistry = new Map<string, Promise<ContributionLogResult>>();
const loggedRegistry = new Set<string>();

/**
 * Standardized contribution logging helper for all create flows.
 * Features:
 * - Module-level dedupe registry (prevents duplicates across hook instances)
 * - Returns success payload for immediate earned-points UI
 * - Normalizes errors into user-friendly English
 * - Tolerates duplicate responses silently
 * - Automatically invalidates contribution summary cache
 */
export function useContributionEventLogger() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<ContributionLogResult, Error, LogContributionEventParams>({
    mutationFn: async ({ actionType, referenceId, details }) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }

      // Build dedupe key
      const dedupeKey = `${actionType}:${referenceId || 'none'}`;

      // Check if already logged in this session
      if (loggedRegistry.has(dedupeKey)) {
        console.log('Client-side dedupe: contribution already logged in this session:', dedupeKey);
        return {
          pointsAwarded: 0,
          rewardType: 'city',
          isDuplicate: true,
          actionType,
          referenceId: referenceId || null,
        };
      }

      // Check if already in flight
      const existingPromise = inFlightRegistry.get(dedupeKey);
      if (existingPromise) {
        console.log('Client-side dedupe: reusing in-flight request:', dedupeKey);
        return existingPromise;
      }

      // Create new backend call
      const promise = (async (): Promise<ContributionLogResult> => {
        try {
          const result = await actor.logContributionEvent(
            actionType,
            referenceId || null,
            details || null
          );

          // Check if backend returned an error variant
          if ('__kind__' in result) {
            if (result.__kind__ === 'ok') {
              // Success - resolve reward values from centralized mapping
              const pointsAwarded = getPointsForAction(actionType);
              const rewardType = getRewardTypeForAction(actionType);
              
              loggedRegistry.add(dedupeKey);
              return {
                pointsAwarded,
                rewardType,
                isDuplicate: false,
                actionType,
                referenceId: referenceId || null,
              };
            } else if (result.__kind__ === 'err') {
              // Backend returned an error variant
              const errorVariant = result.err;
              
              if (errorVariant === 'duplicateContribution') {
                // Tolerate duplicate - don't break the UI flow
                console.log('Duplicate contribution detected (already awarded):', actionType, referenceId);
                loggedRegistry.add(dedupeKey);
                return {
                  pointsAwarded: 0,
                  rewardType: 'city',
                  isDuplicate: true,
                  actionType,
                  referenceId: referenceId || null,
                };
              } else if (errorVariant === 'invalidActionType') {
                throw new Error('Invalid action type: This action cannot earn contributions.');
              } else if (errorVariant === 'referenceIdRequired') {
                throw new Error('Reference not found: A reference ID is required for this action.');
              } else if (errorVariant === 'referenceIdEmpty') {
                throw new Error('Reference not found: The reference ID cannot be empty.');
              } else {
                throw new Error(`Contribution logging failed: ${errorVariant}`);
              }
            }
          }

          // Fallback for unexpected response format
          loggedRegistry.add(dedupeKey);
          return {
            pointsAwarded: 0,
            rewardType: 'city',
            isDuplicate: false,
            actionType,
            referenceId: referenceId || null,
          };
        } catch (error: any) {
          // Check if this is a duplicate contribution error (legacy trap format)
          const errorMessage = error?.message || String(error);
          if (errorMessage.includes('Duplicate contribution') || errorMessage.includes('duplicateContribution')) {
            // Tolerate duplicate - don't break the UI flow
            console.log('Duplicate contribution detected (already awarded):', actionType, referenceId);
            loggedRegistry.add(dedupeKey);
            return {
              pointsAwarded: 0,
              rewardType: 'city',
              isDuplicate: true,
              actionType,
              referenceId: referenceId || null,
            };
          }
          
          // For other errors, normalize and throw
          const friendlyError = userFacingError(error);
          throw new Error(friendlyError);
        } finally {
          // Remove from in-flight registry
          inFlightRegistry.delete(dedupeKey);
        }
      })();

      // Track in-flight
      inFlightRegistry.set(dedupeKey, promise);

      return promise;
    },
    onSuccess: (result) => {
      // Invalidate contribution summary cache on success or tolerated duplicate
      queryClient.invalidateQueries({ queryKey: ['callerContributionSummary'] });
      
      if (!result.isDuplicate) {
        console.log('Contribution event logged successfully:', result);
      }
    },
    onError: (error) => {
      console.error('Failed to log contribution event:', error);
    },
  });
}

/**
 * Get points awarded for an action type (matches backend centralized values)
 */
function getPointsForAction(actionType: string): number {
  switch (actionType) {
    case CONTRIBUTION_ACTION_TYPES.ISSUE_CREATED:
      return 10;
    case CONTRIBUTION_ACTION_TYPES.COMMENT_CREATED:
      return 5;
    case CONTRIBUTION_ACTION_TYPES.EVIDENCE_ADDED:
      return 20;
    default:
      return 0;
  }
}

/**
 * Get reward type for an action type (matches backend centralized values)
 */
function getRewardTypeForAction(actionType: string): string {
  switch (actionType) {
    case CONTRIBUTION_ACTION_TYPES.ISSUE_CREATED:
      return 'city';
    case CONTRIBUTION_ACTION_TYPES.COMMENT_CREATED:
      return 'voting';
    case CONTRIBUTION_ACTION_TYPES.EVIDENCE_ADDED:
      return 'bounty';
    default:
      return 'city';
  }
}
