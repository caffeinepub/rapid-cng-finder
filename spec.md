# Rapid CNG Finder

## Current State
Full-stack CNG station finder app with:
- Public search by city (exact case-insensitive match only)
- Admin panel for managing stations (add/edit/delete)
- Sample data with Pakistani cities (Karachi, Lahore, Multan, Peshawar, Islamabad, Quetta, Faisalabad)
- Popular cities shortcut buttons showing Indian cities (Mumbai, Delhi, Pune, Ahmedabad, Surat) -- mismatched with sample data
- Station cards with "Get Directions" button opening Google Maps

## Requested Changes (Diff)

### Add
- Backend: contains/partial-match search so searching "kara" finds "Karachi" stations

### Modify
- Backend: `searchByCity` uses substring/contains match (case-insensitive) instead of exact match
- Frontend SearchPage: popular cities updated to match actual sample data (Karachi, Lahore, Islamabad, Peshawar, Faisalabad)

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate backend with `containsIgnoreCase` helper replacing exact-match `compareTextIgnoreCase`
2. Update `SearchPage.tsx` popular cities list to Pakistani cities matching sample data
