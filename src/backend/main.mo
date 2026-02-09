import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

actor {
  type InstallationId = Text;
  type CanisterId = Principal;
  type Effect = { installation : InstallationId; canister : CanisterId };

  type Installation = {
    scope : Text;
    owner : Principal;
    parent : ?Principal;
    children : [Effect];
  };

  // For compatibility with old data model
  let installations = Array.empty<Installation>();

  type Proposal = {
    proposer : Principal;
    description : Text;
    instanceName : Text;
    status : Text;
  };

  let proposals = Map.empty<Text, Proposal>();

  public query ({ caller }) func isParent(childId : Principal, parentId : Principal) : async Bool {
    installations.any(
      func(inst) {
        switch (inst.parent) {
          case (?p) { p == parentId };
          case (null) { false };
        };
      }
    );
  };

  public shared ({ caller }) func submitProposal(description : Text, instanceName : Text, status : Text) : async Bool {
    if (proposals.containsKey(instanceName)) {
      return false;
    };
    let newProposal : Proposal = {
      proposer = caller;
      description;
      instanceName;
      status;
    };
    proposals.add(instanceName, newProposal);
    true;
  };

  public shared ({ caller }) func updateProposalStatus(instanceName : Text, newStatus : Text) : async Bool {
    switch (proposals.get(instanceName)) {
      case (null) { false };
      case (?proposal) {
        let currentStatus = proposal.status;
        if (currentStatus != "Pending") {
          return false;
        };
        if (validStatusTransition(currentStatus, newStatus, proposal)) {
          let updatedProposal = { proposal with status = newStatus };
          proposals.add(instanceName, updatedProposal);
          true;
        } else {
          false;
        };
      };
    };
  };

  func validStatusTransition(current : Text, next : Text, _proposal : Proposal) : Bool {
    switch (current, next) {
      case ("Pending", "Approved") { true };
      case ("Pending", "Rejected") { true };
      case (_, "Pending") { false }; // Can´t go back to "Pending"
      case ("Approved", _) { false };
      case ("Rejected", _) { false };
      case ("Pending", _) { false }; // Only allow Approved/Rejected as new status
      case (_, _) { false };
    };
  };

  public query ({ caller }) func isInstanceNameTaken(instanceName : Text) : async Bool {
    proposals.containsKey(instanceName);
  };

  public query ({ caller }) func getProposal(instanceName : Text) : async ?Proposal {
    proposals.get(instanceName);
  };

  public query ({ caller }) func getAllProposals() : async [(Text, Proposal)] {
    proposals.toArray();
  };
};
