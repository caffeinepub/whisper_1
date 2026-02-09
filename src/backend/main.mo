import Text "mo:core/Text";
import Array "mo:core/Array";
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

  let installations = Array.empty<Installation>();

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
};
