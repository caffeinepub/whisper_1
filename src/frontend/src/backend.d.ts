import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ContributionLogEntry {
    id: bigint;
    pointsAwarded: bigint;
    actionType: string;
    referenceId?: string;
    rewardType: string;
    timestamp: bigint;
    details?: string;
    invalidated: boolean;
    contributor: Principal;
}
export interface StakingRecord {
    availableBalance: bigint;
    pendingRewards: bigint;
    lockedBalance: bigint;
    totalStaked: bigint;
}
export interface SecretaryCategorySuggestion {
    statesByGeoId: Array<USState>;
    searchTerm: string;
    locationLevel: USHierarchyLevel;
    proposedCategories: Array<string>;
}
export interface ContributionCriteria {
    actionType: string;
    rewardType: string;
    eligibilityCriteria: string;
    points: bigint;
}
export type SubmitProposalResult = {
    __kind__: "error";
    error: {
        message: string;
    };
} | {
    __kind__: "success";
    success: {
        proposal: Proposal;
    };
};
export interface Task {
    id: bigint;
    completed: boolean;
    description: string;
}
export interface ContributionPoints {
    token: bigint;
    city: bigint;
    voting: bigint;
    bounty: bigint;
}
export interface Proposal {
    status: string;
    geographyLevel: USHierarchyLevel;
    squareMeters: bigint;
    description: string;
    state: string;
    proposer: Principal;
    instanceName: string;
    county: string;
    censusBoundaryId: string;
    population2020: string;
}
export type CensusStateCode = string;
export type GeoId = string;
export interface USGeographyDataChunk {
    states: Array<USState>;
    places: Array<USPlace>;
    counties: Array<USCounty>;
}
export interface USPlace {
    countyFullName: string;
    hierarchicalId: HierarchicalGeoId;
    fullName: string;
    censusCensusFipsCode: string;
    censusLandKm2: bigint;
    shortName: string;
    censusWaterKm2: bigint;
    censusAcres: bigint;
    uspsPlaceType: string;
    population?: bigint;
    censusPlaceType: string;
    censusStateCode: CensusStateCode;
}
export interface ContributionSummary {
    totalCityPoints: bigint;
    totalBountyPoints: bigint;
    totalVotingPoints: bigint;
    totalTokenPoints: bigint;
    totalPoints: bigint;
    contributor: Principal;
}
export interface GovernanceProposal {
    id: bigint;
    status: GovernanceProposalStatus;
    title: string;
    createdAt: bigint;
    description: string;
    proposer: Principal;
}
export interface USCounty {
    censusLandAreaSqMeters: string;
    fipsCode: string;
    hierarchicalId: HierarchicalGeoId;
    censusFipsStateCode: string;
    censusAreaAcres: string;
    fullName: string;
    shortName: string;
    censusWaterAreaSqMeters: string;
    population2010: string;
}
export interface USState {
    censusLandAreaSqMeters: bigint;
    fipsCode: CensusStateCode;
    hierarchicalId: HierarchicalGeoId;
    shortName: string;
    longName: string;
    censusWaterAreaSqMeters: bigint;
    censusAcreage: bigint;
    termType: string;
}
export type ProfileImage = Uint8Array;
export type HierarchicalGeoId = string;
export interface TokenBalance {
    staked: bigint;
    total: bigint;
    voting: bigint;
    bounty: bigint;
}
export interface UserProfile {
    profileImage?: ProfileImage;
    name: string;
    tokenBalance: TokenBalance;
    contributionPoints: ContributionPoints;
}
export enum GovernanceProposalStatus {
    active = "active",
    pending = "pending",
    approved = "approved",
    rejected = "rejected",
    executed = "executed"
}
export enum LogContributionEventError {
    referenceIdEmpty = "referenceIdEmpty",
    referenceIdRequired = "referenceIdRequired",
    duplicateContribution = "duplicateContribution",
    invalidActionType = "invalidActionType"
}
export enum USHierarchyLevel {
    country = "country",
    state = "state",
    place = "place",
    county = "county"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addContributionPoints(points: bigint, rewardType: string, actionType: string): Promise<void>;
    addOrUpdateLocationBasedIssues(locationLevel: USHierarchyLevel, locationId: string | null, issues: Array<string>): Promise<void>;
    adminBurnWSP(account: Principal, amount: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetContributionLogs(offset: bigint, limit: bigint): Promise<Array<[Principal, Array<ContributionLogEntry>]>>;
    adminGetUserContributionLogs(user: Principal, limit: bigint): Promise<Array<ContributionLogEntry>>;
    adminInvalidateContribution(contributor: Principal, entryId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminMintWSP(recipient: Principal, amount: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    backend_getIssueCategoriesByHierarchyLevel(locationLevel: USHierarchyLevel, locationId: string | null): Promise<Array<string>>;
    backend_getUSCountyByHierarchicalId(hierarchicalId: string): Promise<USCounty | null>;
    backend_getUSPlaceByHierarchicalId(hierarchicalId: string): Promise<USPlace | null>;
    backend_getUSStateByHierarchicalId(hierarchicalId: string): Promise<USState | null>;
    createTask(proposalId: string, description: string): Promise<bigint>;
    deleteProposal(instanceName: string): Promise<boolean>;
    getAdminModerationQueue(): Promise<Array<[string, Proposal]>>;
    getAllCityComplaintCategories(): Promise<Array<string>>;
    getAllCountyComplaintCategories(): Promise<Array<string>>;
    getAllProposals(): Promise<Array<[string, Proposal]>>;
    getAllStateComplaintCategories(): Promise<Array<string>>;
    getAllStates(): Promise<Array<USState>>;
    getCallerContributionHistory(limit: bigint): Promise<Array<ContributionLogEntry>>;
    getCallerContributionSummary(): Promise<ContributionSummary>;
    getCallerStakingRecord(): Promise<StakingRecord | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCityById(cityId: string): Promise<USPlace | null>;
    getCityComplaintSuggestions(searchTerm: string): Promise<Array<string>>;
    getContributionCriteria(): Promise<Array<[string, ContributionCriteria]>>;
    getCountiesForState(stateGeoId: GeoId): Promise<Array<USCounty>>;
    getCountyById(countyId: string): Promise<USCounty | null>;
    getCountyComplaintSuggestions(searchTerm: string): Promise<Array<string>>;
    getPlacesForCounty(countyGeoId: GeoId): Promise<Array<USPlace>>;
    getPlacesForState(stateGeoId: GeoId): Promise<Array<USPlace>>;
    getProposal(instanceName: string): Promise<Proposal | null>;
    getSecretaryCategorySuggestion(searchTerm: string, locationLevel: USHierarchyLevel): Promise<SecretaryCategorySuggestion>;
    getSecretaryCategorySuggestions(searchTerm: string, locationLevel: USHierarchyLevel): Promise<Array<string>>;
    getStateById(stateId: string): Promise<USState | null>;
    getStateComplaintSuggestions(searchTerm: string): Promise<Array<string>>;
    getTasks(proposalId: string): Promise<Array<[bigint, Task]>>;
    getTopIssuesForLocation(locationLevel: USHierarchyLevel, locationId: string | null): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStakingRecord(user: Principal): Promise<StakingRecord | null>;
    governanceCreateProposal(title: string, description: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    governanceGetProposal(proposalId: bigint): Promise<GovernanceProposal | null>;
    governanceListProposals(): Promise<Array<GovernanceProposal>>;
    governanceVote(proposalId: bigint, approve: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    hideProposal(instanceName: string): Promise<boolean>;
    icrc1_balance_of(account: Principal): Promise<bigint>;
    icrc1_total_supply(): Promise<bigint>;
    icrc1_transfer(to: Principal, amount: bigint): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    ingestUSGeographyData(data: Array<USGeographyDataChunk>): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isInstanceNameTaken(instanceName: string): Promise<boolean>;
    isParent(_childId: Principal, parentId: Principal): Promise<boolean>;
    logContributionEvent(actionType: string, referenceId: string | null, details: string | null): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: LogContributionEventError;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setContributionCriteria(actionType: string, criteria: ContributionCriteria): Promise<void>;
    submitProposal(description: string, instanceName: string, status: string, state: string, county: string, geographyLevel: USHierarchyLevel, censusBoundaryId: string, squareMeters: bigint, population2020: string): Promise<SubmitProposalResult>;
    updateProposalStatus(instanceName: string, newStatus: string): Promise<boolean>;
    updateTaskStatus(proposalId: string, taskId: bigint, completed: boolean): Promise<boolean>;
}
