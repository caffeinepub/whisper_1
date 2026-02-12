import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Proposal, USState, USCounty, USPlace, ContributionLogEntry, StakingRecord, GovernanceProposal, Post } from '@/backend';
import { getUserFacingError } from '@/utils/userFacingError';
import { USHierarchyLevel } from '@/backend';

export function useGetAllProposals() {
  const { actor, isFetching } = useActor();

  return useQuery<[string, Proposal][]>({
    queryKey: ['proposals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProposals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProposal(instanceName: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Proposal | null>({
    queryKey: ['proposal', instanceName],
    queryFn: async () => {
      if (!actor || !instanceName) return null;
      return actor.getProposal(instanceName);
    },
    enabled: !!actor && !isFetching && !!instanceName,
  });
}

export function useGetAllStates() {
  const { actor, isFetching } = useActor();

  return useQuery<USState[]>({
    queryKey: ['states'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllStates();
      } catch (error) {
        console.error('Error fetching states:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCountiesForState(stateGeoId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USCounty[]>({
    queryKey: ['counties', stateGeoId],
    queryFn: async () => {
      if (!actor || !stateGeoId) return [];
      try {
        return await actor.getCountiesForState(stateGeoId);
      } catch (error) {
        console.error('Error fetching counties:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && !!stateGeoId,
  });
}

export function useGetPlacesForCounty(countyGeoId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USPlace[]>({
    queryKey: ['places', countyGeoId],
    queryFn: async () => {
      if (!actor || !countyGeoId) return [];
      try {
        return await actor.getPlacesForCounty(countyGeoId);
      } catch (error) {
        console.error('Error fetching places:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && !!countyGeoId,
  });
}

export function useGetPlacesForState(stateGeoId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USPlace[]>({
    queryKey: ['places-state', stateGeoId],
    queryFn: async () => {
      if (!actor || !stateGeoId) return [];
      try {
        return await actor.getPlacesForState(stateGeoId);
      } catch (error) {
        console.error('Error fetching places for state:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && !!stateGeoId,
  });
}

export function useGetComplaintCategories(level: USHierarchyLevel, searchTerm: string | null = null) {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['complaintCategories', level, searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getComplaintCategoriesByGeographyLevel(level, searchTerm);
      } catch (error) {
        console.error('Error fetching complaint categories:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStakingInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<StakingRecord | null>({
    queryKey: ['stakingInfo'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getStakingInfo();
      } catch (error) {
        console.error('Error fetching staking info:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetContributionHistory(limit: number = 50) {
  const { actor, isFetching } = useActor();

  return useQuery<ContributionLogEntry[]>({
    queryKey: ['contributionHistory', limit],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCallerContributionHistory(BigInt(limit));
      } catch (error) {
        console.error('Error fetching contribution history:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGovernanceProposals() {
  const { actor, isFetching } = useActor();

  return useQuery<GovernanceProposal[]>({
    queryKey: ['governanceProposals'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.governanceListProposals();
      } catch (error) {
        console.error('Error fetching governance proposals:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGovernanceProposal(proposalId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<GovernanceProposal | null>({
    queryKey: ['governanceProposal', proposalId?.toString()],
    queryFn: async () => {
      if (!actor || proposalId === null) return null;
      try {
        return await actor.governanceGetProposal(proposalId);
      } catch (error) {
        console.error('Error fetching governance proposal:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && proposalId !== null,
  });
}

// Social Feed Queries
export function useGetPostsByInstance(instanceName: string, limit: number = 20, offset: number = 0) {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts', instanceName, limit, offset],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPostsByInstance(instanceName, BigInt(limit), BigInt(offset));
      } catch (error) {
        console.error('Error fetching posts:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && !!instanceName,
  });
}

export function useGetPost(postId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Post | null>({
    queryKey: ['post', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return null;
      try {
        return await actor.getPost(postId);
      } catch (error) {
        console.error('Error fetching post:', error);
        throw new Error(getUserFacingError(error));
      }
    },
    enabled: !!actor && !isFetching && postId !== null,
  });
}
