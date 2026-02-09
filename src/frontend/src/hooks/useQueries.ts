import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';

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

// Additional query hooks will be added here as features are implemented in future phases
