# Rapid CNG Finder

## Current State
The app shows CNG stations in a card grid. Each card shows name, city, address, price/kg, operating hours, and phone. There is no routing or directions feature. Users can only search by city.

## Requested Changes (Diff)

### Add
- "Get Directions" button on each StationCard that opens Google Maps in a new tab with routing from the user's current location to the station's address.
- A "Route" / directions UI: when the user clicks "Get Directions", use the browser Geolocation API to get their current position, then construct a Google Maps directions URL (`https://www.google.com/maps/dir/?api=1&origin=<lat>,<lng>&destination=<encoded address>`) and open it in a new tab.
- If geolocation is denied or unavailable, fall back to opening Google Maps directions with just the destination (no origin), allowing Google Maps to ask for a starting point.
- A small navigation/route icon on the button for clarity.

### Modify
- StationCard: add a "Get Directions" button in the card action area below the details grid.
- SearchPage: no structural changes needed.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `StationCard.tsx`:
   - Add a `handleGetDirections` function that calls `navigator.geolocation.getCurrentPosition`.
   - On success: open `https://www.google.com/maps/dir/?api=1&origin=LAT,LNG&destination=ENCODED_ADDRESS&travelmode=driving`.
   - On failure/denial: open `https://www.google.com/maps/dir/?api=1&destination=ENCODED_ADDRESS&travelmode=driving`.
   - Add a "Get Directions" button (using lucide `Navigation` icon) in the card below the details grid.
   - Keep loading state on the button while geolocation is resolving.
2. Validate and deploy.
