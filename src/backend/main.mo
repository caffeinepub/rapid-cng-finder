import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Char "mo:core/Char";
import Nat "mo:core/Nat";
import Float "mo:core/Float";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply "data migration" on upgrade via the with clause (pattern `with migration = Migration.run`).

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

    let sampleStations : [(Text, Text, Text, Text, Float, StationStatus, Text, Bool)] = [
      // Pakistan Cities
      ("Metro Gas", "123 Main St, Karachi", "Karachi", "6 AM - 10 PM", 120.5, #open, "021-3981-5555", true),
      ("City CNG", "45 Model Town, Lahore", "Lahore", "7 AM - 9 PM", 123.0, #open, "042-2111-4321", true),
      ("Highway Gas", "200 GT Road, Multan", "Multan", "6 AM - 11 PM", 124.2, #closed, "061-8810-2222", true),
      ("North City CNG", "09 North Ave, Peshawar", "Peshawar", "8 AM - 8 PM", 122.5, #open, "091-2782-8888", true),
      ("Al-Amin Gas", "55 Mall Road, Islamabad", "Islamabad", "6 AM - 10 PM", 121.6, #closed, "051-1627-3333", true),
      ("Saddi Gas", "786 Hussain St, Quetta", "Quetta", "8 AM - 10 PM", 123.9, #open, "081-1234-9876", true),
      ("Faisalabad CNG", "330 Iqbal Road, Faisalabad", "Faisalabad", "6 AM - 9 PM", 122.8, #open, "041-2221-5555", true),
      ("Capital Gas", "14 Blue Area, Islamabad", "Islamabad", "7 AM - 11 PM", 120.1, #open, "051-9988-7332", true),

      // Indian Major Highways - NH-33/20 Ranchi
      ("NH33 Ranchi", "227 Kanke Road, Ranchi", "Ranchi", "7 AM - 10 PM", 88.5, #open, "0651-2267011", true),
      ("Ramgarh CNG", "15 Main Road, Ramgarh", "Ramgarh", "6 AM - 10 PM", 89.2, #open, "06553-284088", true),
      ("Hazaribagh Gas", "54 Market Street, Hazaribagh", "Hazaribagh", "8 AM - 9 PM", 90.0, #closed, "06546-257802", true),
      ("Bokaro Service CNG", "Station Road, Bokaro", "Bokaro", "8 AM - 8 PM", 90.5, #open, "06542-245899", true),
      ("Dhanbad Metro CNG", "105 DNR Road, Dhanbad", "Dhanbad", "24 Hours", 92.0, #open, "0326-654782", true),
      ("Koderma CNG", "Piparwar, Koderma", "Koderma", "6 AM - 8 PM", 91.2, #open, "0654-291751", true),
      ("Patna CNG", "Rajendra Path, Patna", "Patna", "8 AM - 9 PM", 91.9, #open, "612-221653", true),

      // NH-20/319
      ("Gaya Express Gas", "Swarajpuri Road, Gaya", "Gaya", "7 AM - 10 PM", 90.5, #open, "631-221093", true),
      ("Jehanabad CNG", "Kutumba Road, Jehanabad", "Jehanabad", "8 AM - 9 PM", 90.8, #open, "612-221633", true),
      ("Aurangabad CNG", "National Highway, Aurangabad", "Aurangabad", "7 AM - 10 PM", 91.12, #open, "612-221643", true),

      // NH-19 Delhi to Kolkata
      ("Delhi Express CNG", "1995 Ring Road, Delhi", "Delhi", "7 AM - 11 PM", 91.0, #open, "011-23889900", true),
      ("Noida Fuel", "50 Sector 62, Noida", "Noida", "6 AM - 10 PM", 90.0, #open, "0120-3889001", true),
      ("Mathura Roadside", "127 GT Road, Mathura", "Mathura", "24 Hours", 89.5, #open, "0565-2891247", true),
      ("Agra City Gas", "117 MG Road, Agra", "Agra", "7 AM - 10 PM", 89.9, #closed, "0562-2359002", true),
      ("Kanpur CNG", "Mall Road, Kanpur", "Kanpur", "24 Hours", 91.4, #open, "512-246832", true),
      ("Prayagraj CNG", "Civil Lines, Prayagraj", "Prayagraj", "8 AM - 9 PM", 90.7, #open, "531-283461", true),
      ("Varanasi Gas", "Bhelupur, Varanasi", "Varanasi", "7 AM - 10 PM", 91.0, #open, "542-226777", true),
      ("Sasaram CNG", "Station Road, Sasaram", "Sasaram", "8 AM - 8 PM", 91.6, #open, "6184-246365", true),
      ("Dehri CNG", "National Highway, Dehri", "Dehri", "24 Hours", 92.1, #open, "6189-246322", true),

      // West Bengal
      ("Asansol CNG", "GT Road, Asansol", "Asansol", "6 AM - 9 PM", 90.6, #open, "341-2221001", true),
      ("Durgapur Station", "Station Road, Durgapur", "Durgapur", "8 AM - 9 PM", 91.1, #open, "343-2277023", true),
      ("Kolkata Central", "Park Street, Kolkata", "Kolkata", "24 Hours", 91.0, #open, "33-22222456", true),
      ("Burdwan CNG", "Highway, Burdwan", "Burdwan", "7 AM - 10 PM", 90.4, #open, "432-2277022", true),

      // NH-44 Jalandhar to Chennai
      ("Jalandhar CNG", "GT Road, Jalandhar", "Jalandhar", "7 AM - 10 PM", 91.5, #open, "181-2268492", true),
      ("Ambala Express Gas", "Mall Road, Ambala", "Ambala", "24 Hours", 90.7, #open, "171-2277321", true),
      ("Nagpur Station", "Central Avenue, Nagpur", "Nagpur", "24/7", 91.3, #open, "712-2233211", true),
      ("Hyderabad CNG", "Secunderabad, Hyderabad", "Hyderabad", "7 AM - 9 PM", 92.2, #open, "40-2267897", true),
      ("Bangalore Gas", "MG Road, Bangalore", "Bangalore", "7 AM - 10 PM", 89.8, #open, "80-22889933", true),
      ("Chennai Central", "Chengalpet, Chennai", "Chennai", "6 AM - 8 PM", 92.0, #open, "44-22556677", true),

      // NH-48 Delhi to Mumbai
      ("Delhi Express", "Connaught Place, Delhi", "Delhi", "24 Hours", 91.0, #open, "011-23889912", true),
      ("Gurgaon City Gas", "MG Road, Gurgaon", "Gurgaon", "7 AM - 11 PM", 90.2, #open, "124-22889900", true),
      ("Jaipur Gas", "Civil Lines, Jaipur", "Jaipur", "6 AM - 9 PM", 90.5, #open, "141-2223444", true),
      ("Ajmer CNG", "Kishangarh Road, Ajmer", "Ajmer", "8 AM - 10 PM", 90.8, #open, "1482-2224455", true),
      ("Udaipur Station", "Nathdwara Road, Udaipur", "Udaipur", "7 AM - 10 PM", 91.1, #open, "294-2444546", true),
      ("Ahmedabad CNG", "Navrangpura, Ahmedabad", "Ahmedabad", "24 Hours", 89.4, #open, "79-22889900", true),
      ("Surat Express Gas", "Ring Road, Surat", "Surat", "6 AM - 10 PM", 91.3, #open, "261-2223444", true),
      ("Mumbai Central", "Linking Road, Mumbai", "Mumbai", "6 AM - 11 PM", 92.0, #open, "022-26789002", true),

      ("Thane CNG", "Ghodbunder Road, Thane", "Thane", "8 AM - 10 PM", 91.6, #open, "253-222428", true),
      ("Khopoli Express", "NH 4, Khopoli", "Khopoli", "7 AM - 9 PM", 91.9, #open, "21924-27656", true),
      ("Lonavala CNG", "Hill Top Road, Lonavala", "Lonavala", "24 Hours", 91.9, #open, "2114-273901", true),
      ("Khandala CNG", "NH 4, Khandala", "Khandala", "8 AM - 9 PM", 91.7, #open, "2114-273902", true),
      ("Pune Gateway Gas", "MG Road, Pune", "Pune", "7 AM - 10 PM", 91.6, #open, "020-24375534", true),

      // Major India Metro Cities
      ("Faridabad City", "Mathura Road, Faridabad", "Faridabad", "6 AM - 10 PM", 91.1, #open, "129-2233303", true),
      ("Palwal CNG", "GT Road, Palwal", "Palwal", "6 AM - 10 PM", 91.2, #open, "1275-2233310", true),
      ("Vrindavan Gas", "Railway Road, Vrindavan", "Vrindavan", "7 AM - 11 PM", 90.4, #open, "565-2914387", true),
      ("Gwalior Station", "Madhav Road, Gwalior", "Gwalior", "8 AM - 10 PM", 90.6, #open, "751-2244956", true),
      ("Kota Express CNG", "Talwandi, Kota", "Kota", "8 AM - 9 PM", 90.2, #open, "744-2219886", true),

      ("Vadodara Gas", "Sayajigunj, Vadodara", "Vadodara", "8 AM - 10 PM", 91.5, #open, "265-2223444", true),
      ("Patna Central", "Exhibition Road, Patna", "Patna", "7 AM - 9 PM", 91.3, #open, "9801837670", true),
      ("Service Centre | CNG Available", "Ghat Road, Ranchi", "Ranchi", "7 AM - 8 PM", 88.7, #open, "651-14088923", true),
      ("Service Centre | CNG Available", "Station Road, Mumbai", "Mumbai", "7 AM - 11 PM", 92.0, #open, "9326202416", true),
      ("Service Centre | CNG Available", "Chennai Central", "Chennai", "8 AM - 12 PM", 92.5, #open, "8885872929", true),

      // NH-48 Extended
      ("Express CNG", "New Delhi", "Delhi", "24 Hours", 91.0, #open, "011-23889955", true),
      ("City Gas", "Paharganj, New Delhi", "Delhi", "7 AM - 10 PM", 91.3, #open, "011-25146826", true),
      ("Gurgaon Gas", "Sector 29, Gurgaon", "Gurgaon", "8 AM - 9 PM", 90.1, #open, "9948800605", true),

      // Additional Indian Cities
      ("Patna Junction", "Near Railway Station, Patna", "Patna", "8 AM - 10 PM", 91.3, #open, "612-2322990", true),
      ("Kolkata Park Street", "Park Street, Kolkata", "Kolkata", "10 AM - 12 PM", 91.6, #open, "9732560233", true),
      ("Pune Airport Road", "Airport Road, Pune", "Pune", "8 AM - 12 PM", 91.5, #open, "9158662503", true),
      ("Delhi South", "South Delhi", "Delhi", "7 AM - 8 PM", 91.0, #open, "9541267113", true),

      // Kolkata Conversions
      ("Conversion Centre", "Bidhan Sarani, Kolkata", "Kolkata", "9:30 AM - 7:30 PM", 91.0, #open, "9830058062", true),
      ("Service Centre | CNG Available", "Tollygunge, Kolkata", "Kolkata", "10 AM - 8 PM", 89.50, #open, "9830691152", true),
      ("LPG Service Centre", "Kolkata", "Kolkata", "No Info", 90.0, #open, "9433302258", true),
      ("Katwa Road", "Katwa Road, Burdwan", "Burdwan", "6 AM - 10 PM", 90.8, #closed, "65634-24515", true),
      ("Service Centre | CNG Available", "Apcar Garden, Asansol", "Asansol", "6 AM - 12 PM", 89.0, #open, "8653547358", true),
      ("Durgapur Airlines", "City Center, Durgapur", "Durgapur", "24 Hours", 91.2, #closed, "0343-1234567", true),
      ("Burdwan CNG", "NH-2, Burdwan", "Burdwan", "7 AM - 9 PM", 89.5, #open, "XXX-9999999", true),

      // NEW Jharkhand Localities on Ranchi Route
      ("Madhuvan CNG - Ormajhi", "NH-33 Highway, Ormajhi, Ranchi", "Ormajhi", "6 AM - 10 PM", 88.6, #open, "0651-2550123", true),
      ("Mansarovar Filling Station - Demotand", "Demotand, Ranchi", "Demotand", "7 AM - 9 PM", 89.0, #open, "0651-2440211", true),
      ("Modi Fuels - Hesagarha", "NH-33, Hesagarha, Ranchi", "Hesagarha", "6 AM - 9 PM", 88.9, #open, "0651-2660345", true),
      ("Milan CNG Station - Charhi", "NH-33, Charhi, Hazaribagh", "Charhi", "7 AM - 10 PM", 89.1, #open, "06546-261044", true),
      ("Ranchi City Gas", "Circular Road, Ranchi", "Ranchi", "6 AM - 10 PM", 88.8, #open, "0651-2330101", true),
      ("Ramgarh Fuel Centre", "Station Road, Ramgarh", "Ramgarh", "24 Hours", 89.5, #open, "06553-224501", true),
      ("Hazaribagh Highway CNG", "NH-33, Hazaribagh", "Hazaribagh", "6 AM - 10 PM", 89.8, #open, "06546-224301", true),
    ];

    for ((name, address, city, operatingHours, pricePerKg, status, phone, isActive) in sampleStations.vals()) {
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

  // Get All Pakistan Cities
  func getPakistanCities() : [Text] {
    ["Karachi", "Lahore", "Multan", "Peshawar", "Islamabad", "Quetta", "Faisalabad"];
  };

  // Get NH-33/20 Cities (India)
  func getNH33_20Cities() : [Text] {
    ["Ranchi", "Ramgarh", "Hazaribagh", "Bokaro", "Dhanbad", "Koderma"];
  };

  // Get NH-19 Cities (India)
  func getNH19Cities() : [Text] {
    [
      "Delhi",
      "Noida",
      "Mathura",
      "Agra",
      "Kanpur",
      "Prayagraj",
      "Varanasi",
      "Sasaram",
      "Dehri",
      "Asansol",
      "Durgapur",
      "Burdwan",
      "Kolkata",
    ];
  };

  // Get NH-44 Cities (India)
  func getNH44Cities() : [Text] {
    ["Jalandhar", "Ambala", "Nagpur", "Hyderabad", "Bangalore", "Chennai"];
  };

  // Get NH-48 Cities (India)
  func getNH48Cities() : [Text] {
    [
      "Delhi",
      "Gurgaon",
      "Jaipur",
      "Ajmer",
      "Udaipur",
      "Ahmedabad",
      "Surat",
      "Mumbai",
      "Thane",
      "Khopoli",
      "Lonavala",
      "Khandala",
      "Pune",
    ];
  };

  // Get Other Major Indian Cities
  func getOtherIndianCities() : [Text] {
    [
      "Faridabad",
      "Palwal",
      "Vrindavan",
      "Gwalior",
      "Kota",
      "Vadodara",
      "Patna",
      "Kanpur",
      "Prayagraj",
      "Varanasi",
    ];
  };

  // Get All Cities Grouped
  public query func getAllCitiesGrouped() : async {
    pakistan : [(Text, Text)];
    nh33_20 : [(Text, Text)];
    nh19 : [(Text, Text)];
    nh44 : [(Text, Text)];
    nh48 : [(Text, Text)];
    other_india : [(Text, Text)];
  } {
    let pakistanCities = getPakistanCities().map(func(city) { ("Pakistan", city) });
    let nh33_20Cities = getNH33_20Cities().map(func(city) { ("NH-33/20", city) });
    let nh19Cities = getNH19Cities().map(func(city) { ("NH-19", city) });
    let nh44Cities = getNH44Cities().map(func(city) { ("NH-44", city) });
    let nh48Cities = getNH48Cities().map(func(city) { ("NH-48", city) });
    let otherIndianCities = getOtherIndianCities().map(func(city) { ("Other India", city) });

    {
      pakistan = pakistanCities;
      nh33_20 = nh33_20Cities;
      nh19 = nh19Cities;
      nh44 = nh44Cities;
      nh48 = nh48Cities;
      other_india = otherIndianCities;
    };
  };

  // Search by Price Range (Public - no auth required)
  public query func searchByPriceRange(minPrice : Float, maxPrice : Float) : async [CNGStation] {
    let filteredStations = stationsMap.values().toArray().filter(
      func(station) {
        station.pricePerKg >= minPrice and station.pricePerKg <= maxPrice
      }
    );
    filteredStations.sort();
  };
};

