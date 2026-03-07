# Rapid CNG Finder

## Current State
The app has a single SearchPage with city-based search. Users type a city name and get a list of CNG stations. There is no route-based search. Popular cities are set to Pakistani cities. Sample data only has Pakistani cities.

## Requested Changes (Diff)

### Add
- Route Search tab on the SearchPage: users can enter a "From" city and "To" city, then see CNG stations for all cities along the route
- Preset routes (e.g. Ranchi → Hazaribagh) as quick-select chips
- A route info banner showing the route distance/segment and cities covered
- Sample data stations in Ranchi and Hazaribagh

### Modify
- SearchPage: add a tab switcher ("City Search" | "Route Search") at the top
- Popular cities list: add Indian cities (Ranchi, Hazaribagh, Delhi, Mumbai, Bangalore)
- Sample data in backend: add Ranchi and Hazaribagh stations
- preloadSampleData: add stations in Ranchi and Hazaribagh

### Remove
- Nothing removed

## Implementation Plan
1. Add a RouteSearchPanel component: two inputs (From/To), preset route chips (Ranchi→Hazaribagh, Delhi→Agra, etc.), a "Find Stations" button
2. On submit, RouteSearchPanel calls searchByCity for each city on the route and merges results
3. Update SearchPage to have a mode toggle ("City Search" | "Route Search"), render the appropriate panel
4. Update popularCities in SearchPage to include Ranchi, Hazaribagh, Delhi, Mumbai
5. Update backend sample data to include Ranchi and Hazaribagh stations
