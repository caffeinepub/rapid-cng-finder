# Rapid CNG Finder

## Current State
The app has a Route Search panel that queries only the specific cities named in a route (from, optional intermediate, to). For preset routes this means only 2-3 cities are queried. All CNG stations stored in the backend may not be shown if they belong to cities not explicitly listed in the route. The `preloadSampleData` function seeds stations in cities: Karachi, Lahore, Multan, Peshawar, Islamabad, Quetta, Faisalabad, Ranchi, Ramgarh, Hazaribagh, Delhi, Noida, Mathura, Agra, Mumbai, Navi Mumbai, Lonavala, Pune.

## Requested Changes (Diff)

### Add
- Route search now fetches ALL stations from the backend and shows every station grouped by city along the route, not just the queried cities.
- For preset routes, all cities in the route are shown in order (e.g. Ranchi → Ramgarh → Hazaribagh).
- For custom routes (from/to typed by user), all stations from all cities are shown, grouped by city, filtered to those whose city name contains the from or to keyword (partial match).
- A new "All Stations on Route" view that aggregates stations from every city that has at least one station and groups them in a clear city-by-city layout.

### Modify
- `RouteSearchPanel`: Instead of querying individual cities via `useSearchByCity`, use `useGetAllStations` to get the full station list, then group stations by city and show all groups. For preset routes, order the city groups to match the route order. For custom routes, show all city groups with stations.
- Preset route definitions expanded to include more intermediate cities where applicable (e.g. Delhi → Noida → Mathura → Agra; Mumbai → Navi Mumbai → Lonavala → Pune).

### Remove
- The per-city query hooks (`useCitySearch` inside `RouteSearchPanel`) are replaced by a single `useGetAllStations` call with client-side grouping.

## Implementation Plan
1. Update `RouteSearchPanel.tsx`:
   - Replace multi-city hook pattern with a single `useGetAllStations` call.
   - For preset routes, define ordered city lists (all intermediate stops).
   - Group all stations by city using client-side logic.
   - For preset routes, order city groups to match the route.
   - For custom routes (non-preset), show all city groups that have stations, sorted alphabetically or by total stations descending.
   - Update stats to reflect all found stations.
2. Expand `PRESET_ROUTES` intermediate arrays to cover all seeded sample cities per route.
