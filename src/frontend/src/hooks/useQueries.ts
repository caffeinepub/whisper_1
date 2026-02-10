import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@icp-sdk/core/principal';
import type { Proposal, DeletionRequest } from '@/backend';

/**
 * Example query hook for checking parent-child installation relationships.
 * This demonstrates the pattern for future backend integration.
 */
export function useIsParent(childId: string, parentId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isParent', childId, parentId],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const childPrincipal = Principal.fromText(childId);
        const parentPrincipal = Principal.fromText(parentId);
        return await actor.isParent(childPrincipal, parentPrincipal);
      } catch (error) {
        console.error('Error checking parent relationship:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!childId && !!parentId,
  });
}

/**
 * Hook to fetch all proposals from the backend.
 * Returns an empty array while actor is initializing to prevent undefined states.
 */
export function useGetAllProposals() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Array<[string, Proposal]>>({
    queryKey: ['proposals'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      try {
        const result = await actor.getAllProposals();
        return result;
      } catch (error) {
        console.error('Error fetching proposals:', error);
        throw new Error('Failed to load proposals. Please try again.');
      }
    },
    enabled: !!actor && !!identity && !isFetching,
    retry: 2,
  });
}

/**
 * Hook to fetch a single proposal by instance name.
 * Returns null if proposal doesn't exist, throws error on fetch failure.
 */
export function useGetProposal(instanceName: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Proposal | null>({
    queryKey: ['proposal', instanceName],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      if (!instanceName) {
        return null;
      }
      try {
        const result = await actor.getProposal(instanceName);
        return result;
      } catch (error) {
        console.error('Error fetching proposal:', error);
        throw new Error('Failed to load proposal details. Please try again.');
      }
    },
    enabled: !!actor && !!identity && !isFetching && !!instanceName,
    retry: 2,
  });
}

/**
 * Hook to check if the current caller is an admin.
 * Identity-aware: only attempts admin check when authenticated.
 * Includes principal in query key to ensure fresh checks per user.
 * Short staleTime ensures admin status refreshes quickly after first-user assignment.
 */
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const principalString = identity?.getPrincipal().toString() || 'anonymous';

  const query = useQuery<boolean>({
    queryKey: ['isCallerAdmin', principalString],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Error checking admin status:', error);
        throw error; // Surface the error instead of returning false
      }
    },
    // Only enable when authenticated and actor is ready
    enabled: !!actor && isAuthenticated && !actorFetching && !isInitializing,
    staleTime: 0, // Always refetch on mount to catch first-user admin assignment
    refetchOnMount: true, // Ensure fresh check when component mounts
    retry: 2,
  });

  return {
    ...query,
    // Provide loading state that accounts for actor initialization and identity
    isLoading: actorFetching || isInitializing || query.isLoading,
    // Only consider fetched when actor is ready, authenticated, and query has completed
    isFetched: !!actor && isAuthenticated && query.isFetched,
    // Expose authentication state for UI gating
    isAuthenticated,
  };
}

/**
 * Hook to fetch all deletion requests (admin only).
 * Returns array of [Principal, DeletionRequest] tuples.
 */
export function useGetDeletionRequests() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Array<[Principal, DeletionRequest]>>({
    queryKey: ['deletionRequests'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      try {
        const result = await actor.getDeletionRequests();
        return result;
      } catch (error) {
        console.error('Error fetching deletion requests:', error);
        throw new Error('Failed to load deletion requests. Please try again.');
      }
    },
    enabled: !!actor && !!identity && !isFetching,
    retry: 2,
  });
}
