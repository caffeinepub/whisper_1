import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";


import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ProfileImage = Storage.ExternalBlob;

  public type UserProfile = {
    name : Text;
    profileImage : ?ProfileImage;
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

  type DeletionRequest = {
    user : Principal;
    requestedAt : Int;
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
  let deletionRequests = Map.empty<Principal, DeletionRequest>();
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

  public shared ({ caller }) func requestDeletion() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request account deletion");
    };
    let request : DeletionRequest = {
      user = caller;
      requestedAt = 0; // In production, use Time.now()
    };
    deletionRequests.add(caller, request);
  };

  public query ({ caller }) func getDeletionRequests() : async [(Principal, DeletionRequest)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view deletion requests");
    };
    deletionRequests.toArray();
  };

  public shared ({ caller }) func processDeletionRequest(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can process deletion requests");
    };
    userProfiles.remove(user);
    deletionRequests.remove(user);
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
        moderationQueue.add(instanceName);
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

  // Geography query functions - accessible to all users including guests
  // Secretary-specific functions for Motoko backend
  public query ({ caller }) func getStateById(hierarchicalId : HierarchicalGeoId) : async ?USState {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this endpoint");
    };
    usGeography.states.get(hierarchicalId);
  };

  public query ({ caller }) func getCountyById(hierarchicalId : HierarchicalGeoId) : async ?USCounty {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this endpoint");
    };
    usGeography.counties.get(hierarchicalId);
  };

  public query ({ caller }) func getCityById(hierarchicalId : HierarchicalGeoId) : async ?USPlace {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this endpoint");
    };
    usGeography.places.get(hierarchicalId);
  };

  public query ({ caller }) func getTop50IssuesForLocation(_level : USHierarchyLevel, _hierarchicalId : ?HierarchicalGeoId) : async [Text] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this endpoint");
    };
    let sortedCityIssues = complaintCategoriesCity.sort(
      func(a, b) { Nat.compare(a.size(), b.size()) }
    );
    sortedCityIssues.sliceToArray(0, 50);
  };

  public query ({ caller }) func searchSimilarCityNames(searchTerm : Text) : async [USPlace] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this endpoint");
    };
    if (searchTerm.trim(#char ' ').size() < 3) {
      Runtime.trap("No results for search term: " # searchTerm);
    };
    let matchingCities = usGeography.places.filter(
      func(_hierarchicalId, place) { place.fullName.toLower().contains(#text(searchTerm.toLower())) }
    );
    let toArrayFiltered = matchingCities.values().toArray();
    toArrayFiltered.sliceToArray(0, Nat.min(toArrayFiltered.size(), 8));
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

  public query ({ caller }) func getPlacesForState(stateGeoId : GeoId) : async [USPlace] {
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

  // Task Management
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
    let filtered = complaintCategoriesCity.filter(
      func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
    );
    let toArrayFiltered = filtered;
    toArrayFiltered.sliceToArray(0, Nat.min(toArrayFiltered.size(), 10));
  };

  public query ({ caller }) func getCountyComplaintSuggestions(searchTerm : Text) : async [Text] {
    let filtered = complaintCategoriesCounty.filter(
      func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
    );
    let toArrayFiltered = filtered;
    toArrayFiltered.sliceToArray(0, Nat.min(toArrayFiltered.size(), 10));
  };

  public query ({ caller }) func getStateComplaintSuggestions(searchTerm : Text) : async [Text] {
    let filtered = complaintCategoriesState.filter(
      func(category) { category.toLower().contains(#text(searchTerm.toLower())) }
    );
    let toArrayFiltered = filtered;
    toArrayFiltered.sliceToArray(0, Nat.min(toArrayFiltered.size(), 10));
  };

  public query ({ caller }) func getAllCityComplaintCategories() : async [Text] {
    complaintCategoriesCity;
  };

  public query ({ caller }) func getAllCountyComplaintCategories() : async [Text] {
    complaintCategoriesCounty;
  };

  public query ({ caller }) func getAllStateComplaintCategories() : async [Text] {
    complaintCategoriesState;
  };

  public query ({ caller }) func getSecretaryCategorySuggestion(searchTerm : Text, locationLevel : USHierarchyLevel) : async SecretaryCategorySuggestion {
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
};
