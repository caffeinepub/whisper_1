import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

// Use migration on upgrade
(with migration = Migration.run)
actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextActionRewardId : Nat = 0;
  var nextLogEntryId : Nat = 0;
  var nextTaskId : Nat = 0;

  public type ProfileImage = Storage.ExternalBlob;

  public type ContributionPoints = {
    city : Nat;
    voting : Nat;
    bounty : Nat;
    token : Nat;
  };

  public type TokenBalance = {
    staked : Nat;
    voting : Nat;
    bounty : Nat;
    total : Nat;
  };

  public type UserProfile = {
    name : Text;
    profileImage : ?ProfileImage;
    tokenBalance : TokenBalance;
    contributionPoints : ContributionPoints;
  };

  public type ContributionReward = {
    points : Nat;
    rewardType : Text;
  };

  public type ContributionLogEntry = {
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

  public type ContributionLogPersistence = {
    persistentEntries : [ContributionLogEntry];
  };

  public type ContributionCriteria = {
    actionType : Text;
    points : Nat;
    rewardType : Text;
    eligibilityCriteria : Text;
  };

  public type ContributionSummary = {
    contributor : Principal;
    totalPoints : Nat;
    totalCityPoints : Nat;
    totalVotingPoints : Nat;
    totalBountyPoints : Nat;
    totalTokenPoints : Nat;
  };

  public type ContributionActionType = {
    #issueCreated;
    #commentCreated;
    #evidenceAdded;
  };

  public type CentralizedRewardValues = {
    issueCreatedReward : ContributionReward;
    commentCreatedReward : ContributionReward;
    evidenceAddedReward : ContributionReward;
  };

  public type LogContributionEventError = {
    #duplicateContribution;
    #invalidActionType;
    #referenceIdRequired;
    #referenceIdEmpty;
  };

  // Governance types (stubs for future DAO)
  public type GovernanceProposal = {
    id : Nat;
    proposer : Principal;
    title : Text;
    description : Text;
    status : GovernanceProposalStatus;
    createdAt : Int;
  };

  public type GovernanceProposalStatus = {
    #pending;
    #active;
    #approved;
    #rejected;
    #executed;
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
  public type USState = {
    hierarchicalId : HierarchicalGeoId;
    shortName : Text;
    longName : Text;
    termType : Text;
    fipsCode : CensusStateCode;
    censusAcreage : Nat;
    censusLandAreaSqMeters : Nat;
    censusWaterAreaSqMeters : Nat;
  };
  public type USCounty = {
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
  public type USPlace = {
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

  type SecretaryCategorySuggestion = {
    searchTerm : Text;
    statesByGeoId : [USState];
    locationLevel : USHierarchyLevel;
    proposedCategories : [Text];
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

  // ICRC-1 Token Ledger State
  let wspBalances = Map.empty<Principal, Nat>();
  var wspTotalSupply : Nat = 31000000; // Initial supply - fixed

  // Contribution Points and Token Accounting
  let contributionLogs = Map.empty<Principal, ContributionLogPersistence>();
  let contributionCriteria = Map.empty<Text, ContributionCriteria>();

  let centralizedRewardValues = {
    issueCreatedReward = { points = 10; rewardType = "city" };
    commentCreatedReward = { points = 5; rewardType = "voting" };
    evidenceAddedReward = { points = 20; rewardType = "bounty" };
  };

  // Track awarded contributions
  let awardedContributions = Map.empty<Text, Bool>();

  // Geography/Proposals State
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
  let allTasks = Map.empty<Text, Map.Map<Nat, Task>>();
  var installations = ([] : [Installation]);
  let moderationQueue = List.empty<Text>();

  let complaintCategoriesCity = [
    "Noise Complaints",
    "Graffiti Removal",
    "Road Potholes",
    "Streetlight Outages",
    "Illegal Dumping",
    "Abandoned Vehicles",
    "Broken Sidewalks",
    "Public Park Maintenance",
    "Water Leaks",
    "Sewer Overflows",
    "Broken Traffic Signals",
    "Zoning Violations",
    "Restaurant Health Inspections",
    "Building Permits Issues",
    "Animal Control Concerns",
    "Parking Violations",
    "Public Transportation Issues",
    "Storm Drain Blockages",
    "Tree Trimming Requests",
    "Neighborhood Watch Concerns",
    "Public Library Services",
    "Recycling Program Issues",
    "Bike Lane Requests",
    "Public Art Installations",
    "Crime Reporting",
    "School Safety Concerns",
    "Community Garden Requests",
    "Local Event Permits",
    "Public Restroom Cleanliness",
    "Emergency Preparedness Information",
    "Business Licensing Issues",
    "Utility Billing Inquiries",
    "Public Safety Campaigns",
    "Youth Programs Support",
    "Senior Services Requests",
    "Housing Assistance Requests",
    "Small Business Support",
    "Community Center Activities",
    "Healthcare Accessibility Issues",
    "Employment Assistance Programs",
    "Public Internet Access Requests",
    "Cultural Festival Organization",
    "Neighborhood Beautification Projects",
    "Affordable Housing Initiatives",
    "Local Food Store Feedback",
    "Public Pool Maintenance",
    "Waste Management Concerns",
    "After-School Program Support",
    "Traffic Calming Requests",
    "Public Art Lighting Issues",
    "Environmental Sustainability Projects",
  ];

  let complaintCategoriesCounty = [
    "Rural Road Maintenance",
    "County Park Upkeep",
    "Flood Zone Concerns",
    "Agricultural Water Use",
    "Public Health Services",
    "Animal Control Issues",
    "Land Use Permits",
    "Emergency Management Plans",
    "Public Transportation Access",
    "County Fair Organization",
    "Wildlife Conservation Efforts",
    "Solid Waste Disposal",
    "Groundwater Contamination",
    "Public Library Expansion",
    "County Facility Maintenance",
    "Bridge Inspections",
    "Rural Broadband Expansion",
    "Historical Preservation",
    "Tourism Promotion",
    "Youth Development Programs",
    "Wildfire Prevention",
    "Elderly Care Services",
    "Food Assistance Programs",
    "Neighborhood Crime Prevention",
    "Public Housing Projects",
    "Transportation Planning",
    "Childcare Services",
    "Business Incentive Programs",
    "Renewable Energy Projects",
    "Floodplain Management",
    "Community Health Clinics",
    "Rural Housing Assistance",
    "Trauma Care Access",
    "Air Quality Concerns",
    "Hazardous Materials Storage",
    "Public Transit Funding",
    "Marine Conservation",
    "Disaster Recovery Efforts",
    "Wildfire Response Planning",
    "Highway Maintenance",
    "Public Safety Training",
    "Waterway Maintenance",
    "Regional Planning",
    "Veterans Services",
    "Community Policing",
    "River Clean-Up Initiatives",
    "Mass Transit Development",
    "Land Conservation Requests",
    "Cultural Heritage Preservation",
    "Emergency Communication Systems",
    "Environmental Education Programs",
  ];

  let complaintCategoriesState = [
    "Education Funding",
    "Healthcare Policy",
    "Transportation Infrastructure",
    "Environmental Protection",
    "Criminal Justice Reform",
    "Taxation Issues",
    "Energy Policy",
    "Public Safety",
    "Economic Development",
    "Affordable Housing",
    "Voting Rights",
    "Gun Control",
    "Marijuana Legalization",
    "Minimum Wage Laws",
    "Transportation Safety",
    "Public Health Initiatives",
    "Alcohol Regulation",
    "Disability Services",
    "Consumer Protection",
    "Military Affairs",
    "Budget Allocation",
    "Tax Exemptions",
    "Digital Access",
    "Public Safety Technology",
    "Healthcare Incentives",
    "Labor Market Programs",
    "Pedestrian Safety",
    "Aging Infrastructure",
    "Childcare Assistance",
    "Tax Compliance",
    "Homelessness Initiatives",
    "Business Development",
    "Legal Services Expansion",
    "Disaster Loans",
    "Healthcare Expansion",
    "Education Technology",
    "Transportation Projects",
    "Energy Programs",
    "Regulatory Reform",
    "Affordable Childcare",
    "Tourism Development",
    "Affordable Housing Grants",
    "Public Library Expansion",
    "Disaster Annex Development",
    "Rehabilitation Funding",
    "Legal Tech Services",
    "Mental Health Assistance",
    "Irrigation Project Funding"
  ];

  // New Map to store location-based complaints
  let locationBasedComplaintMap = Map.empty<Text, [Text]>();

  func hierarchyLevelToText(level : USHierarchyLevel) : Text {
    switch (level) {
      case (#country) { "country" };
      case (#state) { "state" };
      case (#county) { "county" };
      case (#place) { "place" };
    };
  };

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

  func contributionActionTypeToText(actionType : ContributionActionType) : Text {
    switch (actionType) {
      case (#issueCreated) { "IssueCreated" };
      case (#commentCreated) { "CommentCreated" };
      case (#evidenceAdded) { "EvidenceAdded" };
    };
  };

  func textToContributionActionType(actionTypeText : Text) : ?ContributionActionType {
    switch (actionTypeText) {
      case ("IssueCreated") { ?#issueCreated };
      case ("CommentCreated") { ?#commentCreated };
      case ("EvidenceAdded") { ?#evidenceAdded };
      case (_) { null };
    };
  };

  func requiresReferenceId(actionType : ContributionActionType) : Bool {
    switch (actionType) {
      case (#issueCreated) { true };
      case (#commentCreated) { true };
      case (#evidenceAdded) { true };
    };
  };

  func buildDuplicateKey(caller : Principal, actionType : Text, referenceId : ?Text) : Text {
    let callerText = caller.toText();
    let refId = switch (referenceId) {
      case (?id) { id };
      case (null) { "none" };
    };
    callerText # "_" # actionType # "_" # refId;
  };

  public shared ({ caller }) func logContributionEvent(
    actionType : Text,
    referenceId : ?Text,
    details : ?Text,
  ) : async { #ok : Nat; #err : LogContributionEventError } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log contributions");
    };

    // Validate actionType
    let actionTypeVariant = switch (textToContributionActionType(actionType)) {
      case (?variant) { variant };
      case (null) {
        return #err(#invalidActionType);
      };
    };

    // Validate referenceId is provided when required
    if (requiresReferenceId(actionTypeVariant)) {
      switch (referenceId) {
        case (null) {
          return #err(#referenceIdRequired);
        };
        case (?id) {
          if (id.size() == 0) {
            return #err(#referenceIdEmpty);
          };
        };
      };
    };

    // Check for duplicate contribution
    let duplicateKey = buildDuplicateKey(caller, actionType, referenceId);
    if (awardedContributions.containsKey(duplicateKey)) {
      return #err(#duplicateContribution);
    };

    // Resolve reward values from centralized mapping
    let reward = switch (actionTypeVariant) {
      case (#issueCreated) { centralizedRewardValues.issueCreatedReward };
      case (#commentCreated) { centralizedRewardValues.commentCreatedReward };
      case (#evidenceAdded) { centralizedRewardValues.evidenceAddedReward };
    };

    let now = Time.now();
    let logEntry : ContributionLogEntry = {
      id = nextLogEntryId;
      contributor = caller;
      timestamp = now;
      actionType;
      pointsAwarded = reward.points;
      rewardType = reward.rewardType;
      referenceId;
      details;
      invalidated = false;
    };

    let entryId = nextLogEntryId;
    nextLogEntryId += 1;

    // Write contribution log entry
    let newLog : ContributionLogPersistence = switch (contributionLogs.get(caller)) {
      case (null) {
        { persistentEntries = [logEntry] };
      };
      case (?logs) {
        let persistentList = List.empty<ContributionLogEntry>();
        for (e in logs.persistentEntries.values()) {
          persistentList.add(e);
        };
        persistentList.add(logEntry);
        { persistentEntries = persistentList.toArray() };
      };
    };
    contributionLogs.add(caller, newLog);

    // Mark as awarded to prevent duplicates
    awardedContributions.add(duplicateKey, true);

    // Mint WSP tokens for the contribution (idempotent via duplicate check)
    let currentBalance = switch (wspBalances.get(caller)) {
      case (?balance) { balance };
      case (null) { 0 };
    };
    wspBalances.add(caller, currentBalance + reward.points);
    wspTotalSupply += reward.points;

    #ok(entryId);
  };

  public shared ({ caller }) func addContributionPoints(points : Nat, rewardType : Text, actionType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add contribution points");
    };
    let now = Time.now();
    let pointsMap : { var city : Nat; var voting : Nat; var bounty : Nat; var token : Nat } = {
      var city = 0;
      var voting = 0;
      var bounty = 0;
      var token = 0;
    };
    switch (rewardType) {
      case ("city") { pointsMap.city := pointsMap.city + points };
      case ("voting") { pointsMap.voting := pointsMap.voting + points };
      case ("bounty") { pointsMap.bounty := pointsMap.bounty + points };
      case ("token") { pointsMap.token := pointsMap.token + points };
      case (_) { pointsMap.city := pointsMap.city + points };
    };
    let pointsUpdate = {
      city = pointsMap.city : Nat;
      voting = pointsMap.voting : Nat;
      bounty = pointsMap.bounty : Nat;
      token = pointsMap.token : Nat;
    };
    let logEntry : ContributionLogEntry = {
      id = nextLogEntryId;
      contributor = caller;
      timestamp = now;
      actionType;
      pointsAwarded = points;
      rewardType;
      referenceId = null;
      details = null;
      invalidated = false;
    };
    nextLogEntryId += 1;
    let newLog : ContributionLogPersistence = switch (contributionLogs.get(caller)) {
      case (null) {
        { persistentEntries = [logEntry] };
      };
      case (?logs) {
        let persistentList = List.empty<ContributionLogEntry>();
        for (e in logs.persistentEntries.values()) {
          persistentList.add(e);
        };
        persistentList.add(logEntry);
        { persistentEntries = persistentList.toArray() };
      };
    };
    contributionLogs.add(caller, newLog);
  };

  // ===================== ICRC-1 Token Methods ========================

  public query ({ caller }) func icrc1_balance_of(account : Principal) : async Nat {
    // Anyone can query balances (standard ICRC-1 behavior)
    switch (wspBalances.get(account)) {
      case (?balance) { balance };
      case (null) { 0 };
    };
  };

  public query func icrc1_total_supply() : async Nat {
    // Public query, no authentication needed
    wspTotalSupply;
  };

  public shared ({ caller }) func icrc1_transfer(to : Principal, amount : Nat) : async { #ok : Nat; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can transfer tokens");
    };

    let fromBalance = switch (wspBalances.get(caller)) {
      case (?balance) { balance };
      case (null) { 0 };
    };

    if (fromBalance < amount) {
      return #err("Insufficient balance");
    };

    let toBalance = switch (wspBalances.get(to)) {
      case (?balance) { balance };
      case (null) { 0 };
    };

    wspBalances.add(caller, fromBalance - amount);
    wspBalances.add(to, toBalance + amount);

    #ok(amount);
  };

  // ===================== Admin Token Operations ========================

  public shared ({ caller }) func adminMintWSP(recipient : Principal, amount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can mint tokens");
    };

    let currentBalance = switch (wspBalances.get(recipient)) {
      case (?balance) { balance };
      case (null) { 0 };
    };

    wspBalances.add(recipient, currentBalance + amount);
    wspTotalSupply += amount;
  };

  public shared ({ caller }) func adminBurnWSP(account : Principal, amount : Nat) : async { #ok; #err : Text } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can burn tokens");
    };

    let currentBalance = switch (wspBalances.get(account)) {
      case (?balance) { balance };
      case (null) { 0 };
    };

    if (currentBalance < amount) {
      return #err("Insufficient balance to burn");
    };

    wspBalances.add(account, currentBalance - amount);
    wspTotalSupply -= amount;

    #ok;
  };

  public shared ({ caller }) func adminInvalidateContribution(
    contributor : Principal,
    entryId : Nat,
  ) : async { #ok; #err : Text } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can invalidate contributions");
    };

    switch (contributionLogs.get(contributor)) {
      case (null) { #err("Contributor not found") };
      case (?logs) {
        let entries = logs.persistentEntries;
        var found = false;
        var pointsToSlash : Nat = 0;

        let updatedEntries = Array.tabulate(
          entries.size(),
          func(i) {
            let entry = entries[i];
            if (entry.id == entryId and not entry.invalidated) {
              found := true;
              pointsToSlash := entry.pointsAwarded;
              { entry with invalidated = true };
            } else {
              entry;
            };
          }
        );

        if (not found) {
          return #err("Contribution entry not found or already invalidated");
        };

        contributionLogs.add(contributor, { persistentEntries = updatedEntries });

        // Burn the corresponding WSP tokens
        let currentBalance = switch (wspBalances.get(contributor)) {
          case (?balance) { balance };
          case (null) { 0 };
        };

        let newBalance = if (currentBalance >= pointsToSlash) {
          currentBalance - pointsToSlash;
        } else {
          0;
        };

        wspBalances.add(contributor, newBalance);
        wspTotalSupply -= Nat.min(pointsToSlash, currentBalance);

        #ok;
      };
    };
  };

  // ===================== Governance Stubs ========================

  public shared ({ caller }) func governanceCreateProposal(
    title : Text,
    description : Text,
  ) : async { #ok : Nat; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create governance proposals");
    };
    // Stub: Not implemented yet
    #err("Governance proposals not implemented yet");
  };

  public shared ({ caller }) func governanceVote(
    proposalId : Nat,
    approve : Bool,
  ) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can vote on proposals");
    };
    // Stub: Not implemented yet
    #err("Governance voting not implemented yet");
  };

  public query ({ caller }) func governanceGetProposal(proposalId : Nat) : async ?GovernanceProposal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view governance proposals");
    };
    // Stub: Not implemented yet
    null;
  };

  public query ({ caller }) func governanceListProposals() : async [GovernanceProposal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list governance proposals");
    };
    // Stub: Not implemented yet
    [];
  };

  // ===================== Contribution History ========================

  public query ({ caller }) func getCallerContributionHistory(limit : Nat) : async [ContributionLogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their contribution history");
    };

    switch (contributionLogs.get(caller)) {
      case (null) { [] };
      case (?logs) {
        let logsArray = logs.persistentEntries;
        let boundedLimit = Nat.min(limit, 100);
        let actualLimit = Nat.min(boundedLimit, logsArray.size());
        logsArray.sliceToArray(0, actualLimit);
      };
    };
  };

  public query ({ caller }) func getCallerContributionSummary() : async ContributionSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their contribution summary");
    };

    var totalPoints : Nat = 0;
    var totalCityPoints : Nat = 0;
    var totalVotingPoints : Nat = 0;
    var totalBountyPoints : Nat = 0;
    var totalTokenPoints : Nat = 0;

    switch (contributionLogs.get(caller)) {
      case (null) {};
      case (?logs) {
        for (entry in logs.persistentEntries.values()) {
          if (not entry.invalidated) {
            totalPoints += entry.pointsAwarded;
            switch (entry.rewardType) {
              case ("city") { totalCityPoints += entry.pointsAwarded };
              case ("voting") { totalVotingPoints += entry.pointsAwarded };
              case ("bounty") { totalBountyPoints += entry.pointsAwarded };
              case ("token") { totalTokenPoints += entry.pointsAwarded };
              case (_) { totalCityPoints += entry.pointsAwarded };
            };
          };
        };
      };
    };

    {
      contributor = caller;
      totalPoints;
      totalCityPoints;
      totalVotingPoints;
      totalBountyPoints;
      totalTokenPoints;
    };
  };

  public query ({ caller }) func adminGetContributionLogs(
    offset : Nat,
    limit : Nat,
  ) : async [(Principal, [ContributionLogEntry])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all contribution logs");
    };

    let boundedLimit = Nat.min(limit, 50);
    let allEntries = contributionLogs.toArray();
    let totalEntries = allEntries.size();

    if (offset >= totalEntries) {
      return [];
    };

    let endIndex = Nat.min(offset + boundedLimit, totalEntries);
    let slicedEntries = allEntries.sliceToArray(offset, endIndex);

    let result = Array.tabulate(
      (slicedEntries).size(),
      func(i) {
        let (principal, logs) = slicedEntries[i];
        (principal, logs.persistentEntries);
      }
    );
    result;
  };

  public query ({ caller }) func adminGetUserContributionLogs(
    user : Principal,
    limit : Nat,
  ) : async [ContributionLogEntry] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view user contribution logs");
    };

    switch (contributionLogs.get(user)) {
      case (null) { [] };
      case (?logs) {
        let logsArray = logs.persistentEntries;
        let boundedLimit = Nat.min(limit, 100);
        let actualLimit = Nat.min(boundedLimit, logsArray.size());
        logsArray.sliceToArray(0, actualLimit);
      };
    };
  };

  public query ({ caller }) func getContributionCriteria() : async [(Text, ContributionCriteria)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view contribution criteria");
    };
    contributionCriteria.toArray();
  };

  public shared ({ caller }) func setContributionCriteria(
    actionType : Text,
    criteria : ContributionCriteria,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set contribution criteria");
    };
    contributionCriteria.add(actionType, criteria);
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

    if (state.size() == 0) {
      return #error({ message = "Proposal must contain valid state" });
    };
    if (county.size() == 0) {
      return #error({ message = "Proposal must contain valid county" });
    };
    if (censusBoundaryId.size() == 0) {
      return #error({ message = "Proposal must contain valid census boundary id" });
    };
    if (population2020.size() == 0) {
      return #error({ message = "Proposal must contain valid population2020" });
    };
    if (squareMeters == 0) {
      return #error({ message = "Proposal must contain valid squareMeters (greater than 0)" });
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
        moderationQueue.add(instanceName);
        #success({ proposal = newProposal });
      };
      case (?_) {
        #error({
          message = "An unexpected error occurred, unable to create proposal for instance: " # instanceName;
        });
      };
    };
  };

  public shared ({ caller }) func updateProposalStatus(instanceName : Text, newStatus : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
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

  public shared ({ caller }) func hideProposal(instanceName : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can hide proposals");
    };
    let filteredQueue : List.List<Text> = moderationQueue.filter(
      func(name) { name != instanceName }
    );
    moderationQueue.clear();
    for (name in filteredQueue.values()) {
      moderationQueue.add(name);
    };
    true;
  };

  public shared ({ caller }) func deleteProposal(instanceName : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete proposals");
    };
    proposals.remove(instanceName);
    let filteredQueue : List.List<Text> = moderationQueue.filter(
      func(name) { name != instanceName }
    );
    moderationQueue.clear();
    for (name in filteredQueue.values()) {
      moderationQueue.add(name);
    };
    true;
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

  public query ({ caller }) func getAdminModerationQueue() : async [(Text, Proposal)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view moderation queue");
    };
    moderationQueue.toArray().map(
      func(instanceName) {
        switch (proposals.get(instanceName)) {
          case (?proposal) { (instanceName, proposal) };
          case (null) {
            Runtime.trap("Proposal referenced in moderation queue not found: " # instanceName);
          };
        };
      }
    );
  };

  // Geography query functions - require user authentication
  public query ({ caller }) func getAllStates() : async [USState] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access geography data");
    };
    usGeography.states.values().toArray();
  };

  public query ({ caller }) func getCountiesForState(stateGeoId : GeoId) : async [USCounty] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access geography data");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access geography data");
    };
    let placesList = List.empty<USPlace>();
    for ((placeGeoId, place) in usGeography.places.entries()) {
      if (placeGeoId.startsWith(#text(countyGeoId))) { placesList.add(place) };
    };
    let placesArray = placesList.toArray();
    if (placesArray.size() == 0) {
      Runtime.trap("No places found for county GeoId: " # countyGeoId);
    } else { placesArray };
  };

  // New Backend Support: Fetch Places for State
  public query ({ caller }) func getPlacesForState(stateGeoId : GeoId) : async [USPlace] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access geography data");
    };
    let filteredPlacesList = List.empty<USPlace>();
    for ((placeGeoId, place) in usGeography.places.entries()) {
      if (placeGeoId.startsWith(#text(stateGeoId))) {
        filteredPlacesList.add(place);
      };
    };
    let filteredPlaces = filteredPlacesList.toArray();
    if (filteredPlaces.size() == 0) {
      Runtime.trap("No places found for state GeoId: " # stateGeoId);
    } else { filteredPlaces };
  };

  public shared ({ caller }) func ingestUSGeographyData(data : [USGeographyDataChunk]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
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

  // ===================== Task Management ========================
  public shared ({ caller }) func createTask(proposalId : Text, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    switch (proposals.get(proposalId)) {
      case (null) { Runtime.trap("Proposal does not exist") };
      case (?proposal) {
        if (proposal.proposer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only proposal creator or admin can create tasks");
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
          Runtime.trap("Unauthorized: Only proposal creator or admin can update tasks");
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
          Runtime.trap("Unauthorized: Only proposal creator or admin can view tasks");
        };
      };
    };

    switch (allTasks.get(proposalId)) {
      case (null) { Runtime.trap("No tasks found for proposal") };
      case (?tasks) { tasks.toArray() };
    };
  };

  public query ({ caller }) func getCityComplaintSuggestions(searchTerm : Text) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access complaint suggestions");
    };
    let filtered = complaintCategoriesCity.filter(
      func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
    );
    let toArrayFiltered = filtered;
    toArrayFiltered.sliceToArray(0, Nat.min(toArrayFiltered.size(), 10));
  };

  public query ({ caller }) func getCountyComplaintSuggestions(searchTerm : Text) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access complaint suggestions");
    };
    let filtered = complaintCategoriesCounty.filter(
      func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
    );
    let toArrayFiltered = filtered;
    toArrayFiltered.sliceToArray(0, Nat.min(toArrayFiltered.size(), 10));
  };

  public query ({ caller }) func getStateComplaintSuggestions(searchTerm : Text) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access complaint suggestions");
    };
    let filtered = complaintCategoriesState.filter(
      func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
    );
    let toArrayFiltered = filtered;
    toArrayFiltered.sliceToArray(0, Nat.min(toArrayFiltered.size(), 10));
  };

  public query ({ caller }) func getAllCityComplaintCategories() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access complaint categories");
    };
    complaintCategoriesCity;
  };

  public query ({ caller }) func getAllCountyComplaintCategories() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access complaint categories");
    };
    complaintCategoriesCounty;
  };

  public query ({ caller }) func getAllStateComplaintCategories() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access complaint categories");
    };
    complaintCategoriesState;
  };

  public query ({ caller }) func getSecretaryCategorySuggestion(searchTerm : Text, locationLevel : USHierarchyLevel) : async SecretaryCategorySuggestion {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access category suggestions");
    };
    let statesByGeoId = usGeography.states.values().toArray();
    let filteredCategories = switch (locationLevel) {
      case (#place) {
        complaintCategoriesCity.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
      };
      case (#county) {
        complaintCategoriesCounty.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
      };
      case (#state) {
        complaintCategoriesState.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
      };
      case (#country) {
        let stateFiltered = complaintCategoriesState.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
        let countyFiltered = complaintCategoriesCounty.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
        let cityFiltered = complaintCategoriesCity.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
        stateFiltered.concat(countyFiltered).concat(cityFiltered);
      };
    };

    {
      searchTerm;
      locationLevel;
      statesByGeoId;
      proposedCategories = filteredCategories.sliceToArray(0, Nat.min(filteredCategories.size(), 10));
    };
  };

  public query ({ caller }) func getSecretaryCategorySuggestions(searchTerm : Text, locationLevel : USHierarchyLevel) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access category suggestions");
    };
    let filteredCategories = switch (locationLevel) {
      case (#place) {
        complaintCategoriesCity.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
      };
      case (#county) {
        complaintCategoriesCounty.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
      };
      case (#state) {
        complaintCategoriesState.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
      };
      case (#country) {
        let stateFiltered = complaintCategoriesState.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
        let countyFiltered = complaintCategoriesCounty.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
        let cityFiltered = complaintCategoriesCity.filter(
          func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
        );
        stateFiltered.concat(countyFiltered).concat(cityFiltered);
      };
    };

    filteredCategories.sliceToArray(0, Nat.min(filteredCategories.size(), 10));
  };

  // Secretary-only queries for backed geography mapping

  public query ({ caller }) func backend_getUSStateByHierarchicalId(hierarchicalId : Text) : async ?USState {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can access this endpoint");
    };
    usGeography.states.get(hierarchicalId);
  };

  public query ({ caller }) func backend_getUSCountyByHierarchicalId(hierarchicalId : Text) : async ?USCounty {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can access this endpoint");
    };
    usGeography.counties.get(hierarchicalId);
  };

  public query ({ caller }) func backend_getUSPlaceByHierarchicalId(hierarchicalId : Text) : async ?USPlace {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can access this endpoint");
    };
    usGeography.places.get(hierarchicalId);
  };

  public query ({ caller }) func backend_getIssueCategoriesByHierarchyLevel(
    locationLevel : USHierarchyLevel,
    locationId : ?Text,
  ) : async [Text] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can access this endpoint");
    };
    let key = switch (locationId) {
      case (?id) { hierarchyLevelToText(locationLevel) # "_" # id };
      case (null) { hierarchyLevelToText(locationLevel) # "_general" };
    };
    switch (locationBasedComplaintMap.get(key)) {
      case (?issues) { issues.sliceToArray(0, Nat.min(issues.size(), 50)) };
      case (null) {
        switch (locationLevel) {
          case (#place) { complaintCategoriesCity.sliceToArray(0, 50) };
          case (#county) { complaintCategoriesCounty.sliceToArray(0, 50) };
          case (#state) { complaintCategoriesState.sliceToArray(0, 50) };
          case (#country) { complaintCategoriesState.sliceToArray(0, 50) };
        };
      };
    };
  };

  public query ({ caller }) func getStateById(stateId : Text) : async ?USState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access geography data");
    };
    usGeography.states.get(stateId);
  };

  public query ({ caller }) func getCountyById(countyId : Text) : async ?USCounty {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access geography data");
    };
    usGeography.counties.get(countyId);
  };

  public query ({ caller }) func getCityById(cityId : Text) : async ?USPlace {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access geography data");
    };
    usGeography.places.get(cityId);
  };

  public query ({ caller }) func getTopIssuesForLocation(
    locationLevel : USHierarchyLevel,
    locationId : ?Text,
  ) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access location issues");
    };
    let key = switch (locationId) {
      case (?id) { hierarchyLevelToText(locationLevel) # "_" # id };
      case (null) { hierarchyLevelToText(locationLevel) # "_general" };
    };

    switch (locationBasedComplaintMap.get(key)) {
      case (?issues) { issues };
      case (null) {
        switch (locationLevel) {
          case (#place) { complaintCategoriesCity };
          case (#county) { complaintCategoriesCounty };
          case (#state) { complaintCategoriesState };
          case (#country) { complaintCategoriesState };
        };
      };
    };
  };

  public shared ({ caller }) func addOrUpdateLocationBasedIssues(
    locationLevel : USHierarchyLevel,
    locationId : ?Text,
    issues : [Text],
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add or update location-based issues");
    };

    let key = switch (locationId) {
      case (?id) { hierarchyLevelToText(locationLevel) # "_" # id };
      case (null) { hierarchyLevelToText(locationLevel) # "_general" };
    };

    locationBasedComplaintMap.add(key, issues.sliceToArray(0, Nat.min(issues.size(), 50)));
  };
};
