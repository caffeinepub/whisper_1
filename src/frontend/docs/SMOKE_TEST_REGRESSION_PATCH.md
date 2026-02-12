# Regression Smoke Test Checklist

This document provides a focused smoke test checklist for validating regression fixes and the Secretary flow refactor.

## Prerequisites
- Application is running locally or deployed
- User is logged in with Internet Identity
- Geography data has been ingested

## Test Cases

### 1. Logo Rendering (Regression Fix)
**Steps:**
1. Navigate to the homepage
2. Verify the Whisper logo is visible in the header
3. Check that the logo is teal-colored
4. Verify the logo is clickable and returns to home

**Expected Result:**
- Logo renders correctly
- Logo color is teal (#14b8a6)
- Logo is clickable

### 2. Header Hover Styling (Regression Fix)
**Steps:**
1. Navigate to the homepage
2. Hover over navigation items in the header
3. Verify hover state shows teal color

**Expected Result:**
- Hover state is visible
- Hover color is teal
- Transition is smooth

### 3. Profile Actor/Identity (Regression Fix)
**Steps:**
1. Navigate to the Profile page
2. Verify profile loads without "Actor not available" error
3. Edit profile name
4. Save changes
5. Verify save succeeds

**Expected Result:**
- Profile loads successfully
- No actor errors
- Save operation completes

### 4. Back-to-Home Navigation (Regression Fix)
**Steps:**
1. Navigate to any page (e.g., Geography, Profile)
2. Click the back button or home link
3. Verify navigation to homepage works
4. Verify URL updates correctly

**Expected Result:**
- Navigation works via pushState/popstate
- No page reload
- URL updates correctly

### 5. Secretary Geography Suggestions (Regression Fix)
**Steps:**
1. Open Secretary widget
2. Start discovery flow
3. Select a state
4. Verify county/city suggestions appear
5. Verify suggestions are filtered correctly

**Expected Result:**
- Suggestions load successfully
- Filtering works instantly
- No errors in console

### 6. Secretary Flow Engine (New Feature)
**Steps:**
1. Open Secretary widget
2. Verify menu displays with four options
3. Test discovery flow (state → location → result)
4. Test report issue flow (with and without top issues)
5. Test custom category flow
6. Test back-to-menu from any state
7. Test keyword navigation
8. Test unknown input recovery

**Expected Result:**
- All flows work as documented in SMOKE_TEST_SECRETARY_FLOWS.md
- No console errors
- No React hooks warnings
- State transitions are smooth

### 7. Base-Path Deployment

This test validates that the application works correctly when deployed under a non-root base path (e.g., `/whisper/` instead of `/`).

**Prerequisites:**
- Application is built with a non-root `BASE_URL` (e.g., `BASE_URL=/whisper/ pnpm build`)
- Application is served from the configured base path

**Steps:**

#### 7.1 Static Asset Loading
1. Navigate to the homepage
2. Open browser DevTools → Network tab
3. Verify no 404 errors for static assets
4. Check that the following assets load correctly:
   - Whisper logo SVG in header
   - Hero background image
   - Any other images/icons in the UI

**Expected Result:**
- All static assets load successfully
- No 404 errors in Network tab
- Logo and hero image are visible

#### 7.2 Client-Side Navigation
1. From the homepage, click "Geography" in the header
2. Verify URL updates to include base path (e.g., `/whisper/geography`)
3. Verify page content changes without full reload
4. Click browser back button
5. Verify navigation back to home works
6. Click browser forward button
7. Verify navigation forward to Geography works

**Expected Result:**
- Navigation works without page reloads
- URL includes base path correctly
- Browser back/forward buttons work
- No console errors

#### 7.3 Secretary Widget Open/Close
1. From the homepage, click "Get Started" or any button that opens Secretary
2. Verify Secretary widget opens correctly
3. Verify widget UI renders properly (no missing styles/assets)
4. Click the X button to close Secretary
5. Verify widget closes correctly

**Expected Result:**
- Secretary widget opens and closes smoothly
- Widget UI renders correctly
- No missing assets or styling issues
- No console errors

#### 7.4 Secretary Discovery Flow
1. Open Secretary widget
2. Select "Find your city on Whisper" (discovery flow)
3. Select a state from the typeahead
4. Verify county/city suggestions appear
5. Select a county or city
6. Verify discovery result message appears

**Expected Result:**
- Discovery flow works correctly under base path
- State selection triggers county/city suggestions
- Location selection completes flow
- No errors related to geography lookup

#### 7.5 Secretary-Triggered Navigation
1. Open Secretary widget
2. Type "proposals" or "view proposals"
3. Verify Secretary recognizes the keyword
4. Verify Secretary navigates to proposals section (scrolls to #proposals)
5. Verify Secretary widget closes after navigation

**Expected Result:**
- Keyword recognition works
- Navigation to proposals section works
- Secretary closes after successful navigation
- No console errors

#### 7.6 Secretary Report Issue Flow
1. Open Secretary widget
2. Select "Report an issue" or type "report issue"
3. Follow the report issue flow (select location, category)
4. Verify all steps work correctly under base path

**Expected Result:**
- Report issue flow works correctly
- Location selection works
- Category suggestions load
- No errors related to base path

**Overall Expected Result:**
- Application functions correctly under non-root base path
- All navigation (header links, Secretary-triggered, browser back/forward) works
- Static assets load from correct base path
- Secretary widget and all its flows work correctly
- No console errors or React warnings

## Detailed Secretary Flow Tests

For comprehensive Secretary flow testing, refer to:
- `frontend/docs/SMOKE_TEST_SECRETARY_FLOWS.md` - 25 test cases covering intent recognition, slot filling, repair behavior, and category suggestions

## Notes

- Run these tests after any changes to navigation, asset loading, or Secretary widget
- Test both with and without base path configuration
- If any test fails, check browser console for errors
- Verify no React hooks warnings appear during testing
