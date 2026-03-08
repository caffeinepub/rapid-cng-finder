# Rapid CNG Finder

## Current State
A CNG station finder web app with:
- Public search by city/route
- Admin panel (Internet Identity login) to manage stations and load sample data
- Multiple NH routes with CNG stations
- Get Directions button (Google Maps)

No PWA support -- the app cannot be installed on Android/iOS home screens.

## Requested Changes (Diff)

### Add
- `manifest.webmanifest` in `public/` with app name, short name, theme color, background color, icons (192x192 and 512x512), display standalone, orientation portrait, start_url
- `sw.js` (service worker) in `public/` for offline caching of app shell assets
- PWA meta tags in `index.html`: theme-color, apple-touch-icon, apple-mobile-web-app-capable, description, manifest link
- "Add to Home Screen" install prompt component in the React app that:
  - Listens for the `beforeinstallprompt` event (Android/Chrome)
  - Shows a banner/button prompting users to install
  - Handles the iOS Safari case with a manual instruction tooltip
  - Dismisses gracefully if user declines or already installed
- Service worker registration in `main.tsx`

### Modify
- `index.html`: add all PWA meta tags and manifest link
- `vite.config.js`: no changes needed (service worker handled manually via public/)

### Remove
- Nothing removed

## Implementation Plan
1. Create `public/manifest.webmanifest` with correct fields pointing to generated icons
2. Create `public/sw.js` as a basic cache-first service worker for the app shell
3. Update `index.html` to link manifest and add all required PWA meta tags
4. Create `src/components/InstallPrompt.tsx` -- detects install eligibility, shows banner on Android and instructions on iOS
5. Register service worker in `main.tsx`
6. Mount `<InstallPrompt />` in `App.tsx`
