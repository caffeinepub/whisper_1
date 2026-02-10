import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Proposal } from '@/backend';

export interface ModerationItem {
  id: string;
  title: string;
  category: string;
  status: 'Pending' | 'Flagged' | 'Approved' | 'Rejected';
  submittedBy: string;
  submittedAt: Date;
  instanceName: string;
}

interface UseModerationItemsOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch moderation items from the backend admin moderation queue.
 * Maps backend proposal data into UI moderation item shape, automatically excluding hidden items.
 */
export function useModerationItems(options: UseModerationItemsOptions = {}) {
  const { actor, isFetching: actorFetching } = useActor();
  const { enabled = true } = options;

  const query = useQuery<ModerationItem[]>({
    queryKey: ['moderationItems'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      try {
        const proposals = await actor.getAdminModerationQueue();
        
        // Map proposals to moderation items
        const items: ModerationItem[] = proposals.map(([instanceName, proposal]) => ({
          id: instanceName,
          title: `${proposal.description} (${instanceName})`,
          category: 'Proposal',
          status: proposal.status as 'Pending' | 'Approved' | 'Rejected',
          submittedBy: proposal.proposer.toString().slice(0, 8) + '...',
          submittedAt: new Date(), // Backend doesn't store timestamp yet
          instanceName,
        }));

        return items;
      } catch (error) {
        console.error('Error fetching moderation items:', error);
        throw error; // Surface the actual error instead of wrapping
      }
    },
    enabled: !!actor && !actorFetching && enabled,
    retry: 2,
  });

  return {
    ...query,
    // Provide loading state that accounts for actor initialization
    isLoading: actorFetching || query.isLoading,
    // Only consider fetched when actor is ready and query has completed
    isFetched: !!actor && query.isFetched,
  };
}
