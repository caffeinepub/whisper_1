import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Proposal, UserRole, USHierarchyLevel, USState, USCounty, USPlace, StakingRecord } from '@/backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', principal],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', principal],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
    staleTime: 0,
    refetchOnMount: true,
  });
}

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

export function useGetTopIssuesForLocation(
  locationLevel: USHierarchyLevel | null,
  locationId: string | null,
  enabled: boolean = true
) {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['topIssues', locationLevel, locationId],
    queryFn: async () => {
      if (!actor || !locationLevel) return [];
      return actor.getTopIssuesForLocation(locationLevel, locationId);
    },
    enabled: !!actor && !isFetching && !!locationLevel && enabled,
  });
}

// New query hooks for Step 1: Geography by ID endpoints
export function useGetStateById(stateId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USState | null>({
    queryKey: ['state', stateId],
    queryFn: async () => {
      if (!actor || !stateId) return null;
      return actor.getStateById(stateId);
    },
    enabled: !!actor && !isFetching && !!stateId,
  });
}

export function useGetCountyById(countyId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USCounty | null>({
    queryKey: ['county', countyId],
    queryFn: async () => {
      if (!actor || !countyId) return null;
      return actor.getCountyById(countyId);
    },
    enabled: !!actor && !isFetching && !!countyId,
  });
}

export function useGetCityById(cityId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<USPlace | null>({
    queryKey: ['city', cityId],
    queryFn: async () => {
      if (!actor || !cityId) return null;
      return actor.getCityById(cityId);
    },
    enabled: !!actor && !isFetching && !!cityId,
  });
}

// Staking query hooks for Step 1
export function useGetCallerStakingRecord() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  return useQuery<StakingRecord | null>({
    queryKey: ['stakingRecord', principal],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerStakingRecord();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}
