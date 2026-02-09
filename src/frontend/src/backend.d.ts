import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Proposal {
    status: string;
    description: string;
    proposer: Principal;
    instanceName: string;
}
export interface backendInterface {
    getAllProposals(): Promise<Array<[string, Proposal]>>;
    getProposal(instanceName: string): Promise<Proposal | null>;
    isInstanceNameTaken(instanceName: string): Promise<boolean>;
    isParent(childId: Principal, parentId: Principal): Promise<boolean>;
    submitProposal(description: string, instanceName: string, status: string): Promise<boolean>;
    updateProposalStatus(instanceName: string, newStatus: string): Promise<boolean>;
}
