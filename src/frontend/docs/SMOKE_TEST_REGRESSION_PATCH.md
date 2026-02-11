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

### 7. Base-Path Deployment (If Applicable)
**Steps:**
1. Deploy application under a non-root base path
2. Verify all assets load correctly
3. Verify navigation works
4. Verify Secretary widget functions

**Expected Result:**
- All assets resolve correctly
- Navigation works under base path
- Secretary functions normally

## Notes
- This checklist focuses on regression validation and new Secretary features
- For comprehensive Secretary testing, refer to SMOKE_TEST_SECRETARY_FLOWS.md
- For full application testing, refer to SMOKE_TEST_INSTANCE_FOLLOWUPS.md
