import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldContributionLogEntry = {
    id : Nat;
    contributor : Principal;
    timestamp : Int;
    actionType : Text;
    pointsAwarded : Nat;
    rewardType : Text;
    referenceId : ?Text;
    details : ?Text;
  };

  type OldContributionLogPersistence = {
    persistentEntries : [OldContributionLogEntry];
  };

  type OldActor = {
    contributionLogs : Map.Map<Principal, OldContributionLogPersistence>;
  };

  type NewContributionLogEntry = {
    id : Nat;
    contributor : Principal;
    timestamp : Int;
    actionType : Text;
    pointsAwarded : Nat;
    rewardType : Text;
    referenceId : ?Text;
    details : ?Text;
    invalidated : Bool;
  };

  type NewContributionLogPersistence = {
    persistentEntries : [NewContributionLogEntry];
  };

  type NewActor = {
    contributionLogs : Map.Map<Principal, NewContributionLogPersistence>;
  };

  public func run(old : OldActor) : NewActor {
    let newContributionLogs = old.contributionLogs.map<Principal, OldContributionLogPersistence, NewContributionLogPersistence>(
      func(_principal, oldLog) {
        {
          persistentEntries = oldLog.persistentEntries.map<OldContributionLogEntry, NewContributionLogEntry>(
            func(oldEntry) {
              { oldEntry with invalidated = false };
            }
          );
        };
      }
    );
    { contributionLogs = newContributionLogs };
  };
};
