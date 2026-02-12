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
export interface ContributionCriteria {
    actionType: string;
    rewardType: string;
    eligibilityCriteria: string;
    points: bigint;
}
export interface Task {
    id: bigint;
    completed: boolean;
    description: string;
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
export type CensusStateCode = string;
export interface ContributionPoints {
    token: bigint;
    city: bigint;
    voting: bigint;
    bounty: bigint;
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
export interface StructuredCivicTask {
    id: bigint;
    status: TaskStatus;
    assignee?: Principal;
    title: string;
    createdAt: bigint;
    description: string;
    history: Array<TaskHistoryEntry>;
    updatedAt: bigint;
    issueId?: string;
    locationId: string;
    category: string;
}
export interface GovernanceProposal {
    id: bigint;
    status: GovernanceProposalStatus;
    title: string;
    votes: GovernanceVotes;
    createdAt: bigint;
    description: string;
    proposer: Principal;
}
export interface Post {
    id: bigint;
    deleted: boolean;
    content: string;
    createdAt: bigint;
    authorName: string;
    flaggedByModerator: boolean;
    author: Principal;
    updatedAt?: bigint;
    flaggedReason?: string;
    flaggedAt?: bigint;
    flaggedBy?: Principal;
    instanceName: string;
    isFlagged: boolean;
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
export interface CreatePostRequest {
    content: string;
    instanceName: string;
}
export interface TaskHistoryEntry {
    status: TaskStatus;
    description: string;
    timestamp: bigint;
}
export interface GovernanceVotes {
    tally: {
        approved: bigint;
        rejected: bigint;
    };
    votes: Array<GovernanceVote>;
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
export type GeoId = string;
export interface USGeographyDataChunk {
    states: Array<USState>;
    places: Array<USPlace>;
    counties: Array<USCounty>;
}
export interface UpdatePostRequest {
    content: string;
    postId: bigint;
}
export interface ContributionSummary {
    totalCityPoints: bigint;
    totalBountyPoints: bigint;
    totalVotingPoints: bigint;
    totalTokenPoints: bigint;
    totalPoints: bigint;
    contributor: Principal;
}
export interface GovernanceVote {
    voter: Principal;
    approve: boolean;
    timestamp: bigint;
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
export enum TaskStatus {
    resolved = "resolved",
    blocked = "blocked",
    in_progress = "in_progress",
    open = "open"
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
    clearFlag(postId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    convertIssueToTask(title: string, description: string, category: string, locationId: string, issueId: string): Promise<bigint>;
    createPost(request: CreatePostRequest): Promise<{
        __kind__: "ok";
        ok: Post;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createTask(title: string, description: string, category: string, locationId: string, issueId: string | null): Promise<bigint>;
    createTask_legacy(proposalId: string, description: string): Promise<bigint>;
    deletePost(postId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteProposal(instanceName: string): Promise<boolean>;
    flagPost(postId: bigint, reason: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    flagPostByModerator(postId: bigint, reason: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAdminModerationQueue(): Promise<Array<[string, Proposal]>>;
    getAllProposals(): Promise<Array<[string, Proposal]>>;
    getAllStates(): Promise<Array<USState>>;
    getCallerContributionHistory(limit: bigint): Promise<Array<ContributionLogEntry>>;
    getCallerContributionSummary(): Promise<ContributionSummary>;
    getCallerStakingRecord(): Promise<StakingRecord | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComplaintCategoriesByGeographyLevel(level: USHierarchyLevel, searchTerm: string | null): Promise<Array<string>>;
    getContributionCriteria(): Promise<Array<[string, ContributionCriteria]>>;
    getCountiesForState(stateGeoId: GeoId): Promise<Array<USCounty>>;
    getFlaggedPostLimit(limit: bigint): Promise<Array<Post>>;
    getFlaggedPosts(limit: bigint, offset: bigint): Promise<Array<Post>>;
    getFlaggedPostsCount(): Promise<bigint>;
    getPlacesForCounty(countyGeoId: GeoId): Promise<Array<USPlace>>;
    getPlacesForState(stateGeoId: GeoId): Promise<Array<USPlace>>;
    getPost(postId: bigint): Promise<Post | null>;
    getPostsByAuthor(author: Principal, limit: bigint, offset: bigint): Promise<Array<Post>>;
    getPostsByInstance(instanceName: string, limit: bigint, offset: bigint): Promise<Array<Post>>;
    getProposal(instanceName: string): Promise<Proposal | null>;
    getStakingInfo(): Promise<StakingRecord | null>;
    getTask(taskId: bigint, locationId: string): Promise<StructuredCivicTask>;
    getTasks_legacy(proposalId: string): Promise<Array<[bigint, Task]>>;
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
    listTasksByIssueId(issueId: string): Promise<Array<StructuredCivicTask>>;
    listTasksByLocation(locationId: string): Promise<Array<StructuredCivicTask>>;
    logContributionEvent(actionType: string, referenceId: string | null, details: string | null): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: LogContributionEventError;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setContributionCriteria(actionType: string, criteria: ContributionCriteria): Promise<void>;
    stake(amount: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitProposal(description: string, instanceName: string, status: string, state: string, county: string, geographyLevel: USHierarchyLevel, censusBoundaryId: string, squareMeters: bigint, population2020: string): Promise<SubmitProposalResult>;
    unstake(amount: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updatePost(request: UpdatePostRequest): Promise<{
        __kind__: "ok";
        ok: Post;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateProposalStatus(instanceName: string, newStatus: string): Promise<boolean>;
    updateTask(taskId: bigint, title: string, description: string, category: string, locationId: string, status: TaskStatus): Promise<boolean>;
    updateTaskStatus_legacy(proposalId: string, taskId: bigint, completed: boolean): Promise<boolean>;
}
