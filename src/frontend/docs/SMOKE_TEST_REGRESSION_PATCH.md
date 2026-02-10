# Smoke Test: Regression Patch Validation

This document provides a focused manual QA checklist for validating the regression fixes applied in this patch.

## Test Environment Setup
- Test in both development (`npm run start`) and production build (`npm run build && npm run preview`)
- Test with BASE_URL set to both `/` (root) and `/whisper/` (subpath) to verify base-path safety
- Test on desktop (Chrome/Firefox) and mobile (iOS Safari/Android Chrome) viewports

## Regression 1: Header Logo Rendering

### Desktop View
1. Navigate to home page
2. **Expected**: Whisper logo image appears in header next to "Whisper" text
3. **Expected**: Logo is visible and not broken
4. If logo fails to load (simulate by blocking `/whisper-logo.svg`):
   - **Expected**: "Whisper" text remains visible (logo hidden gracefully)
   - **Expected**: No broken image icon or blank space

### Mobile View
1. Resize browser to mobile width (< 768px) or use device
2. Open mobile hamburger menu
3. **Expected**: Logo and "Whisper" text visible in header
4. **Expected**: Logo behavior consistent with desktop (graceful fallback if missing)

### Base-Path Safety
1. Deploy or configure with `BASE_URL=/whisper/`
2. Navigate to `/whisper/`
3. **Expected**: Logo loads correctly from base-path-prefixed URL
4. **Expected**: No 404 errors in network tab for logo asset

**Status**: ☐ Pass ☐ Fail  
**Notes**:

---

## Regression 2: Hover Color Styling

### Navigation Links
1. Hover over "Geography" link in header (desktop)
2. **Expected**: Text color changes to accent color (not black)
3. Repeat for "Admin" and "Profile" links (if visible)
4. **Expected**: Consistent accent hover color across all nav links

### Mobile Menu
1. Open mobile hamburger menu
2. Hover over navigation items
3. **Expected**: Hover state uses accent color (not black)
4. **Expected**: No unintended black text on hover

**Status**: ☐ Pass ☐ Fail  
**Notes**:

---

## Regression 3: Profile Load/Save with Identity Scoping

### First Login (New Principal)
1. Clear browser data / use incognito
2. Click "Login" and authenticate with Internet Identity
3. Navigate to Profile page
4. **Expected**: Profile setup form appears (not "Actor not available" error)
5. Enter name and optionally upload profile image
6. Click "Save"
7. **Expected**: Save succeeds with success toast
8. **Expected**: No "Actor not available" error

### Existing Profile Load
1. Log out and log back in with same principal
2. Navigate to Profile page
3. **Expected**: Previously saved name and image load correctly
4. **Expected**: No profile setup form (existing profile displayed)

### Cross-User Cache Isolation
1. Log out
2. Log in with a different Internet Identity principal
3. Navigate to Profile page
4. **Expected**: New principal sees profile setup form (not previous user's data)
5. Save a different name/image
6. **Expected**: Save succeeds
7. Log out and log back in as first principal
8. **Expected**: First principal's profile loads (not second user's data)

### Logout Cache Clearing
1. While logged in, navigate to Profile page
2. Click "Logout" button in Profile header
3. **Expected**: Logout succeeds with success toast
4. **Expected**: Redirected or prompted to log in again
5. **Expected**: No stale profile data visible after logout

**Status**: ☐ Pass ☐ Fail  
**Notes**:

---

## Regression 4: Back to Home Navigation

### From Profile Page
1. Navigate to Profile page (via header link or direct URL)
2. Click "Back to Home" button in Profile header
3. **Expected**: Navigates to home page (hero section visible)
4. **Expected**: URL updates to home path
5. **Expected**: No full page reload (SPA navigation)

### From Geography Page
1. Navigate to Geography page
2. Click "Back to Home" button
3. **Expected**: Navigates to home page
4. **Expected**: URL updates correctly

### Browser Back/Forward
1. Navigate: Home → Profile → Back to Home (via button)
2. Click browser back button
3. **Expected**: Returns to Profile page
4. Click browser forward button
5. **Expected**: Returns to Home page
6. **Expected**: History remains coherent (no broken states)

### Base-Path Safety
1. Deploy or configure with `BASE_URL=/whisper/`
2. Navigate to `/whisper/profile`
3. Click "Back to Home"
4. **Expected**: Navigates to `/whisper/` (not `/`)
5. **Expected**: Home page renders correctly

**Status**: ☐ Pass ☐ Fail  
**Notes**:

---

## Regression 5: Secretary Geography-Driven Suggestions

### State-Level Suggestions
1. Open Secretary widget
2. Select "Report an Issue"
3. If prompted, select a state (e.g., "California")
4. Do NOT select county or place
5. Enter issue description (e.g., "education")
6. **Expected**: Suggestions load for state-level categories
7. **Expected**: Suggestions change when description changes
8. **Expected**: No errors or blank suggestion list

### County-Level Suggestions
1. Open Secretary widget
2. Select "Report an Issue"
3. Select a state, then select a county
4. Do NOT select a place
5. Enter issue description (e.g., "roads")
6. **Expected**: Suggestions load for county-level categories
7. **Expected**: Suggestions differ from state-level categories

### Place-Level Suggestions
1. Open Secretary widget
2. Select "Report an Issue"
3. Select a state, county, and place (city)
4. Enter issue description (e.g., "noise")
5. **Expected**: Suggestions load for city-level categories
6. **Expected**: Suggestions differ from county/state categories

### Geography Change Refetch
1. In Secretary widget, select state → county → place
2. Enter issue description and view suggestions
3. Click "Back to menu" and restart "Report an Issue"
4. Select a different state
5. Enter same issue description
6. **Expected**: Suggestions refetch and may differ based on new geography

### Loading/Error States
1. Open Secretary widget and start "Report an Issue" flow
2. While suggestions are loading:
   - **Expected**: Loading indicator or message visible
   - **Expected**: UI remains interactive (no freeze)
3. If backend returns error (simulate by disconnecting):
   - **Expected**: Error message displayed (not crash)
   - **Expected**: User can retry or go back to menu

**Status**: ☐ Pass ☐ Fail  
**Notes**:

---

## Regression 6: Build Success

### Frontend Build
1. Run `npm run build` in `frontend/` directory
2. **Expected**: Build completes without errors
3. **Expected**: No TypeScript compilation errors
4. **Expected**: No missing module errors

### Backend Build
1. Run `dfx build backend` (or equivalent)
2. **Expected**: Backend compiles successfully
3. **Expected**: No Motoko compilation errors

**Status**: ☐ Pass ☐ Fail  
**Notes**:

---

## Summary

**Total Tests**: 6 regressions  
**Passed**: ___  
**Failed**: ___  

**Overall Status**: ☐ All Pass ☐ Some Failures  

**Tester Name**: _______________  
**Date**: _______________  
**Environment**: ☐ Development ☐ Production ☐ Subpath Deployment  

**Additional Notes**:
