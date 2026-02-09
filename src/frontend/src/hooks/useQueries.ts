import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';
import type { Proposal } from '@/backend';

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
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

/**
 * Hook to fetch a single proposal by instance name.
 * Returns null if proposal doesn't exist, throws error on fetch failure.
 */
export function useGetProposal(instanceName: string) {
  const { actor, isFetching } = useActor();

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
    enabled: !!actor && !isFetching && !!instanceName,
    retry: 2,
  });
}

/**
 * Hook to check if the current caller is an admin.
 */
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
