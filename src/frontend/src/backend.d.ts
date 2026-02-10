import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SecretaryCategorySuggestion {
    statesByGeoId: Array<USState>;
    searchTerm: string;
    locationLevel: USHierarchyLevel;
    proposedCategories: Array<string>;
}
export type CensusStateCode = string;
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
export interface UserProfile {
    profileImage?: ProfileImage;
    name: string;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTask(proposalId: string, description: string): Promise<bigint>;
    deleteProposal(instanceName: string): Promise<boolean>;
    getAdminModerationQueue(): Promise<Array<[string, Proposal]>>;
    getAllCityComplaintCategories(): Promise<Array<string>>;
    getAllCountyComplaintCategories(): Promise<Array<string>>;
    getAllProposals(): Promise<Array<[string, Proposal]>>;
    getAllStateComplaintCategories(): Promise<Array<string>>;
    getAllStates(): Promise<Array<USState>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCityComplaintSuggestions(searchTerm: string): Promise<Array<string>>;
    getCountiesForState(stateGeoId: GeoId): Promise<Array<USCounty>>;
    getCountyComplaintSuggestions(searchTerm: string): Promise<Array<string>>;
    getPlacesForCounty(countyGeoId: GeoId): Promise<Array<USPlace>>;
    getPlacesForState(stateGeoId: GeoId): Promise<Array<USPlace>>;
    getProposal(instanceName: string): Promise<Proposal | null>;
    getSecretaryCategorySuggestion(searchTerm: string, locationLevel: USHierarchyLevel): Promise<SecretaryCategorySuggestion>;
    getStateComplaintSuggestions(searchTerm: string): Promise<Array<string>>;
    getTasks(proposalId: string): Promise<Array<[bigint, Task]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hideProposal(instanceName: string): Promise<boolean>;
    ingestUSGeographyData(data: Array<USGeographyDataChunk>): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isInstanceNameTaken(instanceName: string): Promise<boolean>;
    isParent(_childId: Principal, parentId: Principal): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitProposal(description: string, instanceName: string, status: string, state: string, county: string, geographyLevel: USHierarchyLevel, censusBoundaryId: string, squareMeters: bigint, population2020: string): Promise<SubmitProposalResult>;
    updateProposalStatus(instanceName: string, newStatus: string): Promise<boolean>;
    updateTaskStatus(proposalId: string, taskId: bigint, completed: boolean): Promise<boolean>;
}
