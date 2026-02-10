import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };
  type GeoId = Text;
  type CensusId = Text;
  type HierarchicalGeoId = Text;
  type CensusStateCode = Text;
  type GeoRes = { #hierarchicalId : HierarchicalGeoId; #geoId : GeoId; #censusId : CensusId };
  type HierarchicalGeoIdRes = { #hierarchicalGeoId : HierarchicalGeoId };
  type HierarchicalGeoIdOrDescription = {
    #description : Text;
    #hierarchicalId : HierarchicalGeoId;
  };
  type HierarchicalGeoIdOrName = { #name : Text; #hierarchicalId : HierarchicalGeoId };
  public type USHierarchyLevel = { #country; #state; #county; #place };
  type Effect = { installation : Text; canister : Principal };
  type USCountry = { name : Text; countryGeoId : Text };
  type USState = {
    hierarchicalId : HierarchicalGeoId;
    shortName : Text;
    longName : Text;
    termType : Text;
    fipsCode : CensusStateCode;
    censusAcreage : Nat;
    censusLandAreaSqMeters : Nat;
    censusWaterAreaSqMeters : Nat;
  };
  type USCounty = {
    hierarchicalId : HierarchicalGeoId;
    fullName : Text;
    shortName : Text;
    fipsCode : Text;
    censusFipsStateCode : Text;
    censusAreaAcres : Text;
    censusLandAreaSqMeters : Text;
    censusWaterAreaSqMeters : Text;
    population2010 : Text;
  };
  type USPlace = {
    hierarchicalId : HierarchicalGeoId;
    fullName : Text;
    shortName : Text;
    countyFullName : Text;
    censusStateCode : CensusStateCode;
    censusCensusFipsCode : Text;
    population : ?Nat;
    uspsPlaceType : Text;
    censusPlaceType : Text;
    censusAcres : Int;
    censusLandKm2 : Int;
    censusWaterKm2 : Int;
  };
  type USGeographyDataChunk = {
    states : [USState];
    counties : [USCounty];
    places : [USPlace];
  };
  type USGeography = {
    country : USCountry;
    states : Map.Map<HierarchicalGeoId, USState>;
    counties : Map.Map<HierarchicalGeoId, USCounty>;
    places : Map.Map<HierarchicalGeoId, USPlace>;
  };
  type USGeographySummary = { numStates : Nat; numCounties : Nat };
  type Installation = { scope : Text; owner : Principal; parent : ?Principal; children : [Effect] };
  public type Proposal = {
    proposer : Principal;
    description : Text;
    instanceName : Text;
    status : Text;
    state : Text;
    county : Text;
    geographyLevel : USHierarchyLevel;
    censusBoundaryId : Text;
    squareMeters : Nat;
    population2020 : Text;
  };
  type USStateToCountyDataBranch = {
    stateFipsCode : CensusStateCode;
    counties : Map.Map<GeoId, USCounty>;
    geoidMapping : Map.Map<GeoId, CensusId>;
    censusidMapping : Map.Map<CensusId, GeoId>;
  };

  type Task = {
    id : Nat;
    description : Text;
    completed : Bool;
  };

  public type SubmitProposalResult = {
    #success : { proposal : Proposal };
    #error : {
      message : Text;
    };
  };

  func emptyUSGeographyData() : USGeography {
    {
      country = { name = "United States of America"; countryGeoId = "US" };
      states = Map.empty<HierarchicalGeoId, USState>();
      counties = Map.empty<HierarchicalGeoId, USCounty>();
      places = Map.empty<HierarchicalGeoId, USPlace>();
    };
  };

  func emptyUSGeographySummary() : USGeographySummary {
    {
      numStates = 0;
      numCounties = 0;
    };
  };

  func emptyStateToCountyDataBranch() : {
    stateFipsCode : CensusStateCode;
    counties : Map.Map<GeoId, USCounty>;
    geoidMapping : Map.Map<GeoId, CensusId>;
    censusidMapping : Map.Map<CensusId, GeoId>;
  } {
    {
      stateFipsCode = "UNKNOWN";
      counties = Map.empty<GeoId, USCounty>();
      geoidMapping = Map.empty<GeoId, CensusId>();
      censusidMapping = Map.empty<CensusId, GeoId>();
    };
  };

  func emptyProposal() : Proposal {
    {
      proposer = Principal.fromText("yjodo-zjugt-2jgxw-g5t2k-6huzk-wfvod-xqpa6-p5fy3-q4ayc-jcpso-haa");
      description = "empty";
      instanceName = "empty";
      status = "empty";
      state = "empty";
      county = "empty";
      geographyLevel = #state;
      censusBoundaryId = "empty";
      squareMeters = 0;
      population2020 = "empty";
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let geoIdToCensusIdMap = Map.empty<GeoId, CensusId>();
  let censusIdToGeoIdMap = Map.empty<CensusId, GeoId>();
  let hierarchicalGeoIdToGeoIdMap = Map.empty<HierarchicalGeoId, GeoId>();
  let hierarchicalGeoIdToCensusIdMap = Map.empty<HierarchicalGeoId, CensusId>();
  let usGeography = emptyUSGeographyData();
  let usGeographySummary = emptyUSGeographySummary();
  let stateFipsToCountyData = Map.empty<CensusStateCode, {
    stateFipsCode : CensusStateCode;
    counties : Map.Map<GeoId, USCounty>;
    geoidMapping : Map.Map<GeoId, CensusId>;
    censusidMapping : Map.Map<CensusId, GeoId>;
  }>();

  let proposals = Map.empty<Text, Proposal>();
  var nextTaskId = 0;
  let allTasks = Map.empty<Text, Map.Map<Nat, Task>>();
  stable var installations : [Installation] = [];

  func validStatusTransition(current : Text, next : Text, _proposal : Proposal) : Bool {
    switch (current, next) {
      case ("Pending", "Approved") { true };
      case ("Pending", "Rejected") { true };
      case (_, "Pending") { false };
      case ("Approved", _) { false };
      case ("Rejected", _) { false };
      case ("Pending", _) { false };
      case (_, _) { false };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func isParent(_childId : Principal, parentId : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check parent relationships");
    };
    installations.any(
      func(inst) {
        switch (inst.parent) { case (?p) { p == parentId }; case (null) { false } };
      }
    );
  };

  public shared ({ caller }) func submitProposal(
    description : Text,
    instanceName : Text,
    status : Text,
    state : Text,
    county : Text,
    geographyLevel : USHierarchyLevel,
    censusBoundaryId : Text,
    squareMeters : Nat,
    population2020 : Text,
  ) : async SubmitProposalResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit proposals");
    };
    if (proposals.containsKey(instanceName)) {
      return #error({
        message = "Instance name already exists";
      });
    };

    // Geography validation - all required fields must be non-empty
    if (state.size() == 0) {
      return #error({ message = "Proposal must contain valid state"; });
    };
    if (county.size() == 0) {
      return #error({ message = "Proposal must contain valid county"; });
    };
    if (censusBoundaryId.size() == 0) {
      return #error({ message = "Proposal must contain valid census boundary id"; });
    };
    if (population2020.size() == 0) {
      return #error({ message = "Proposal must contain valid population2020"; });
    };
    if (squareMeters == 0) {
      return #error({ message = "Proposal must contain valid squareMeters (greater than 0)"; });
    };

    switch (proposals.get(instanceName)) {
      case (null) {
        let newProposal = {
          proposer = caller;
          description;
          instanceName;
          status;
          state;
          county;
          geographyLevel;
          censusBoundaryId;
          squareMeters;
          population2020;
        };
        proposals.add(instanceName, newProposal);
        #success { proposal = newProposal };
      };
      case (?_) {
        #error({
          message = "An unexpected error occurred, unable to create proposal for instance: " # instanceName;
        });
      };
    };
  };

  public shared ({ caller }) func updateProposalStatus(instanceName : Text, newStatus : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update proposal status");
    };
    switch (proposals.get(instanceName)) {
      case (null) { false };
      case (?proposal) {
        let currentStatus = proposal.status;
        if (currentStatus != "Pending") { return false };
        if (validStatusTransition(currentStatus, newStatus, proposal)) {
          let updatedProposal = { proposal with status = newStatus };
          proposals.add(instanceName, updatedProposal);
          true;
        } else { false };
      };
    };
  };

  public query ({ caller }) func isInstanceNameTaken(instanceName : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check instance names");
    };
    proposals.containsKey(instanceName);
  };

  public query ({ caller }) func getProposal(instanceName : Text) : async ?Proposal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view proposals");
    };
    proposals.get(instanceName);
  };

  public query ({ caller }) func getAllProposals() : async [(Text, Proposal)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view proposals");
    };
    proposals.toArray();
  };

  public query ({ caller }) func getAllStates() : async [USState] {
    usGeography.states.values().toArray();
  };

  public query ({ caller }) func getCountiesForState(stateGeoId : GeoId) : async [USCounty] {
    let countiesList = List.empty<USCounty>();
    for ((countyGeoId, county) in usGeography.counties.entries()) {
      if (countyGeoId.startsWith(#text(stateGeoId))) { countiesList.add(county) };
    };
    let countiesArray = countiesList.toArray();
    if (countiesArray.size() == 0) {
      Runtime.trap("No counties found for state GeoId: " # stateGeoId);
    } else { countiesArray };
  };

  public query ({ caller }) func getPlacesForCounty(countyGeoId : GeoId) : async [USPlace] {
    let placesList = List.empty<USPlace>();
    for ((placeGeoId, place) in usGeography.places.entries()) {
      if (placeGeoId.startsWith(#text(countyGeoId))) { placesList.add(place) };
    };
    let placesArray = placesList.toArray();
    if (placesArray.size() == 0) {
      Runtime.trap("No places found for county GeoId: " # countyGeoId);
    } else { placesArray };
  };

  public shared ({ caller }) func ingestUSGeographyData(data : [USGeographyDataChunk]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can ingest geography data");
    };
    let newStates = Map.empty<HierarchicalGeoId, USState>();
    let newCounties = Map.empty<HierarchicalGeoId, USCounty>();
    let newPlaces = Map.empty<HierarchicalGeoId, USPlace>();
    for (chunk in data.values()) {
      for (state in chunk.states.values()) { newStates.add(state.hierarchicalId, state) };
      for (county in chunk.counties.values()) { newCounties.add(county.hierarchicalId, county) };
      for (place in chunk.places.values()) { newPlaces.add(place.hierarchicalId, place) };
    };
    let newGeography = {
      country = { name = "United States of America"; countryGeoId = "US" };
      states = newStates;
      counties = newCounties;
      places = newPlaces;
    };
    let newGeographySummary = { numStates = newStates.size(); numCounties = newCounties.size() };
    usGeography.states.clear();
    usGeography.counties.clear();
    usGeography.places.clear();
    for ((hierarchicalId, state) in newStates.entries()) {
      usGeography.states.add(hierarchicalId, state);
    };
    for ((hierarchicalId, county) in newCounties.entries()) {
      usGeography.counties.add(hierarchicalId, county);
    };
    for ((hierarchicalId, place) in newPlaces.entries()) {
      usGeography.places.add(hierarchicalId, place);
    };
  };

  // Task Management
  public shared ({ caller }) func createTask(proposalId : Text, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    switch (proposals.get(proposalId)) {
      case (null) { Runtime.trap("Proposal does not exist") };
      case (?proposal) {
        if (proposal.proposer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Only proposal creator can create a Task");
        };
      };
    };

    let task = {
      id = nextTaskId;
      description;
      completed = false;
    };

    switch (allTasks.get(proposalId)) {
      case (null) {
        let newTaskMap = Map.empty<Nat, Task>();
        newTaskMap.add(nextTaskId, task);
        allTasks.add(proposalId, newTaskMap);
      };
      case (?existingTasks) {
        existingTasks.add(nextTaskId, task);
      };
    };

    nextTaskId += 1;
    task.id;
  };

  public shared ({ caller }) func updateTaskStatus(proposalId : Text, taskId : Nat, completed : Bool) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    switch (proposals.get(proposalId)) {
      case (null) { Runtime.trap("Proposal does not exist") };
      case (?proposal) {
        if (proposal.proposer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Only proposal creator can update task");
        };
      };
    };

    switch (allTasks.get(proposalId)) {
      case (null) { Runtime.trap("No tasks found for proposal") };
      case (?tasks) {
        switch (tasks.get(taskId)) {
          case (null) { Runtime.trap("Task does not exist") };
          case (?task) {
            let updatedTask = { task with completed };
            tasks.add(taskId, updatedTask);
            true;
          };
        };
      };
    };
  };

  public query ({ caller }) func getTasks(proposalId : Text) : async [(Nat, Task)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    switch (proposals.get(proposalId)) {
      case (null) { Runtime.trap("Proposal does not exist") };
      case (?proposal) {
        if (proposal.proposer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Only proposal creator or admin can view tasks");
        };
      };
    };

    switch (allTasks.get(proposalId)) {
      case (null) { Runtime.trap("No tasks found for proposal") };
      case (?tasks) { tasks.toArray() };
    };
  };
};
