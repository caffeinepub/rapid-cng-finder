# Rapid CNG Finder

## Current State
Full-stack CNG station finder app. Users can search stations by city or browse all. Admins can log in via Internet Identity to add/edit/delete stations and load sample data. A route search panel shows stations along the Ranchi-Hazaribagh corridor.

The backend `searchByCity` function currently filters by `station.isActive AND city contains query`. The `getAllStations` function returns ALL stations regardless of `isActive`. This mismatch causes search to return 0 results while "All CNG Stations" shows stations correctly.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Backend `searchByCity`: Remove the `isActive` filter so it returns all stations whose city matches the query (same as `getAllStations` behavior). This fixes search returning 0 results.

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend with `searchByCity` that only filters by city name match (no `isActive` filter).
2. Keep all other backend functions identical.
3. Frontend code stays the same -- no changes needed.
