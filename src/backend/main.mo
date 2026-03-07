import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Char "mo:core/Char";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
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

  // CNG Station Type
  public type CNGStation = {
    id : Nat;
    name : Text;
    address : Text;
    city : Text;
    operatingHours : Text;
    pricePerKg : Float;
    status : StationStatus;
    phone : Text;
    isActive : Bool;
  };

  public type StationStatus = {
    #open;
    #closed;
  };

  module CNGStation {
    public func compare(station1 : CNGStation, station2 : CNGStation) : Order.Order {
      Text.compare(station1.name, station2.name);
    };
  };

  // State Variables
  let stationsMap = Map.empty<Nat, CNGStation>();
  var nextId : Nat = 1;

  // Helper: Validate station data
  func validateStationData(name : Text, city : Text) {
    if (name.size() == 0 or city.size() == 0) {
      Runtime.trap("Name and city cannot be empty");
    };
  };

  // Convert a character to uppercase (ASCII only)
  func charToUpper(c : Char) : Char {
    switch (c) {
      case ('a') { 'A' };
      case ('b') { 'B' };
      case ('c') { 'C' };
      case ('d') { 'D' };
      case ('e') { 'E' };
      case ('f') { 'F' };
      case ('g') { 'G' };
      case ('h') { 'H' };
      case ('i') { 'I' };
      case ('j') { 'J' };
      case ('k') { 'K' };
      case ('l') { 'L' };
      case ('m') { 'M' };
      case ('n') { 'N' };
      case ('o') { 'O' };
      case ('p') { 'P' };
      case ('q') { 'Q' };
      case ('r') { 'R' };
      case ('s') { 'S' };
      case ('t') { 'T' };
      case ('u') { 'U' };
      case ('v') { 'V' };
      case ('w') { 'W' };
      case ('x') { 'X' };
      case ('y') { 'Y' };
      case ('z') { 'Z' };
      case (_) { c };
    };
  };

  // Convert a text to uppercase (ASCII only)
  func textToUpper(t : Text) : Text {
    let chars = t.toArray();
    let upperChars = chars.map(charToUpper);
    Text.fromArray(upperChars);
  };

  // Check if haystack contains needle (case-insensitive, ASCII only)
  func containsIgnoreCase(haystack : Text, needle : Text) : Bool {
    if (needle.size() == 0) { return true };

    let haystackUpper = textToUpper(haystack);
    let needleUpper = textToUpper(needle);

    let haystackArray = haystackUpper.toArray();
    let needleArray = needleUpper.toArray();
    let haystackLen = haystackArray.size();
    let needleLen = needleArray.size();

    if (needleLen > haystackLen) { return false };

    for (i in Nat.range(0, haystackLen - needleLen + 1)) {
      var match = true;
      for (j in Nat.range(0, needleLen)) {
        if (haystackArray[i + j] != needleArray[j]) {
          match := false;
        };
      };
      if (match) { return true };
    };
    false;
  };

  // Add Station (Admin Only)
  public shared ({ caller }) func addStation(
    name : Text,
    address : Text,
    city : Text,
    operatingHours : Text,
    pricePerKg : Float,
    status : StationStatus,
    phone : Text,
    isActive : Bool,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add stations");
    };
    validateStationData(name, city);

    let station : CNGStation = {
      id = nextId;
      name;
      address;
      city;
      operatingHours;
      pricePerKg;
      status;
      phone;
      isActive;
    };

    stationsMap.add(nextId, station);
    let currentId = nextId;
    nextId += 1;
    currentId;
  };

  // Update Station (Admin Only)
  public shared ({ caller }) func updateStation(
    id : Nat,
    name : Text,
    address : Text,
    city : Text,
    operatingHours : Text,
    pricePerKg : Float,
    status : StationStatus,
    phone : Text,
    isActive : Bool,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update stations");
    };
    validateStationData(name, city);

    switch (stationsMap.get(id)) {
      case (null) { Runtime.trap("Station not found") };
      case (?existing) {
        let updated : CNGStation = {
          id;
          name;
          address;
          city;
          operatingHours;
          pricePerKg;
          status;
          phone;
          isActive;
        };
        stationsMap.add(id, updated);
      };
    };
  };

  // Delete Station (Admin Only)
  public shared ({ caller }) func deleteStation(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete stations");
    };

    switch (stationsMap.get(id)) {
      case (null) { Runtime.trap("Station not found") };
      case (_) { stationsMap.remove(id) };
    };
  };

  // Get Single Station (Public - no auth required)
  public query func getStation(id : Nat) : async CNGStation {
    switch (stationsMap.get(id)) {
      case (null) { Runtime.trap("Station not found") };
      case (?station) { station };
    };
  };

  // Get All Stations (Public - no auth required)
  public query func getAllStations() : async [CNGStation] {
    let stations = stationsMap.values().toArray();
    stations.sort();
  };

  // Search by City (Public - no auth required, NO isActive filtering)
  public query func searchByCity(city : Text) : async [CNGStation] {
    let matchingStations = stationsMap.values().toArray().filter(
      func(station : CNGStation) : Bool {
        containsIgnoreCase(station.city, city);
      }
    );
    matchingStations.sort();
  };

  // Preload Sample Data (Admin Only)
  public shared ({ caller }) func preloadSampleData() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can preload data");
    };

    let samples : [(Text, Text, Text, Text, Float, StationStatus, Text, Bool)] = [
      ("Metro Gas", "123 Main St, Karachi", "Karachi", "6 AM - 10 PM", 120.5, #open, "021-3981-5555", true),
      ("City CNG", "45 Model Town, Lahore", "Lahore", "7 AM - 9 PM", 123.0, #open, "042-2111-4321", true),
      ("Highway Gas", "200 GT Road, Multan", "Multan", "6 AM - 11 PM", 124.2, #closed, "061-8810-2222", true),
      ("North City CNG", "09 North Ave, Peshawar", "Peshawar", "8 AM - 8 PM", 122.5, #open, "091-2782-8888", true),
      ("Al-Amin Gas", "55 Mall Road, Islamabad", "Islamabad", "6 AM - 10 PM", 121.6, #closed, "051-1627-3333", true),
      ("Saddi Gas", "786 Hussain St, Quetta", "Quetta", "8 AM - 10 PM", 123.9, #open, "081-1234-9876", true),
      ("Faisalabad CNG", "330 Iqbal Road, Faisalabad", "Faisalabad", "6 AM - 9 PM", 122.8, #open, "041-2221-5555", true),
      ("Capital Gas", "14 Blue Area, Islamabad", "Islamabad", "7 AM - 11 PM", 120.1, #open, "051-9988-7332", true),
    ];

    for ((name, address, city, operatingHours, pricePerKg, status, phone, isActive) in samples.vals()) {
      let station : CNGStation = {
        id = nextId;
        name;
        address;
        city;
        operatingHours;
        pricePerKg;
        status;
        phone;
        isActive;
      };
      stationsMap.add(nextId, station);
      nextId += 1;
    };
  };
};
