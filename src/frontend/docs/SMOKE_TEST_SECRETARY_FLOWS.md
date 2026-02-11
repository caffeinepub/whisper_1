# Secretary Flow Smoke Test

This document provides a focused manual smoke test checklist for the Secretary assistant after the modular flow engine refactor and intent/slot mini-flow engine integration.

## Prerequisites
- Application is running locally or deployed
- User is logged in with Internet Identity
- Geography data has been ingested (states, counties, cities)

## Test Cases

### 1. Menu Display
**Steps:**
1. Open the Secretary widget
2. Verify menu is displayed with four options:
   - Discover Your City
   - Report an Issue
   - View Proposals
   - Create Instance

**Expected Result:**
- All four menu options are visible
- Each option has an appropriate icon
- Greeting message is displayed

### 2. Discovery Flow - Complete Path
**Steps:**
1. Click "Discover Your City"
2. Type and select a state (e.g., "California")
3. Type and select a county or city (e.g., "Los Angeles County")
4. Verify result message is displayed
5. Click "View Top Issues"
6. Verify top issues are displayed (or appropriate message if none)
7. Click "Back to Menu"

**Expected Result:**
- State typeahead works with instant filtering
- County/city typeahead shows combined options
- Result message indicates whether instance exists
- Top issues are displayed or fallback message shown
- Back to menu returns to main menu

### 3. Report Issue Flow - With Top Issues
**Steps:**
1. Complete discovery flow to select a location
2. Click "Report an Issue"
3. Wait for loading message
4. Verify top issues are displayed
5. Click on one of the top issues
6. Verify category selected message
7. Verify navigation to Issue Project

**Expected Result:**
- Loading message appears briefly
- Top issues are displayed as clickable buttons
- Selecting an issue shows confirmation
- Issue Project dialog opens with selected category

### 4. Report Issue Flow - No Top Issues
**Steps:**
1. From menu, click "Report an Issue" (without discovery)
2. Verify description prompt is displayed
3. Type a description (e.g., "broken streetlight")
4. Submit the description
5. Verify suggestions are displayed
6. Click on a suggestion
7. Verify category selected and navigation

**Expected Result:**
- Description input is shown
- Suggestions appear based on description
- Selecting a suggestion completes the flow
- Issue Project dialog opens

### 5. Report Issue Flow - Custom Category
**Steps:**
1. Start report issue flow
2. If top issues shown, click "Something else"
3. If suggestions shown, click "Something else"
4. Enter a custom category
5. Submit
6. Verify category selected and navigation

**Expected Result:**
- "Something else" button is available
- Custom category input is shown
- Custom category is accepted
- Issue Project dialog opens

### 6. Keyword Navigation
**Steps:**
1. From menu, type "proposals" in the text input
2. Submit
3. Verify navigation to Proposals page

**Expected Result:**
- Secretary recognizes keyword
- Navigates to correct page
- Secretary widget closes

### 7. Deep Link Navigation
**Steps:**
1. From menu, type "#proposals" in the text input
2. Submit
3. Verify navigation to Proposals page

**Expected Result:**
- Secretary recognizes deep link
- Navigates to correct page
- Secretary widget closes

### 8. Unknown Input Recovery
**Steps:**
1. From menu, type random text (e.g., "xyz123")
2. Submit
3. Verify recovery message is displayed
4. Verify "Back to Menu" button is available
5. Click "Back to Menu"

**Expected Result:**
- Recovery message explains input wasn't understood
- Back to Menu button is visible
- Clicking returns to main menu

### 9. Back to Menu from Any State
**Steps:**
1. Navigate through discovery flow to any intermediate state
2. Click "Back to Menu" button (arrow icon in header)
3. Verify return to menu
4. Verify state is reset (no previous selections retained)

**Expected Result:**
- Back button is visible in header when not on menu
- Clicking returns to menu immediately
- Previous flow state is cleared

### 10. External Navigation (View Proposals)
**Steps:**
1. From menu, click "View Proposals"
2. Verify navigation to Proposals page
3. Verify Secretary widget closes

**Expected Result:**
- Navigates to Proposals page
- Widget closes automatically

### 11. External Navigation (Create Instance)
**Steps:**
1. From menu, click "Create Instance"
2. Verify navigation to Create Instance section
3. Verify Secretary widget closes

**Expected Result:**
- Navigates to Create Instance section
- Widget closes automatically

### 12. Intent Recognition - Report Issue (Free Text)
**Steps:**
1. From menu, type "I want to report a problem"
2. Submit
3. Verify Secretary recognizes intent and starts slot-filling
4. Verify state selection prompt is displayed

**Expected Result:**
- Intent is recognized from free text
- Secretary transitions to slot-filling mode
- State typeahead is shown

### 13. Intent Recognition - Find Instance (Free Text)
**Steps:**
1. From menu, type "find my city"
2. Submit
3. Verify Secretary recognizes intent
4. Verify state selection prompt is displayed

**Expected Result:**
- Intent is recognized
- Slot-filling begins with state selection

### 14. Intent Recognition - Create Instance (Free Text)
**Steps:**
1. From menu, type "create new instance"
2. Submit
3. Verify Secretary recognizes intent
4. Verify state selection prompt is displayed

**Expected Result:**
- Intent is recognized
- Slot-filling begins with state selection

### 15. Intent Recognition - Ask Category (Free Text)
**Steps:**
1. From menu, type "what categories can I report"
2. Submit
3. Verify Secretary recognizes intent
4. Verify state selection prompt is displayed

**Expected Result:**
- Intent is recognized
- Slot-filling begins with state selection

### 16. Slot Filling - Complete Report Issue Flow
**Steps:**
1. From menu, type "report an issue"
2. Select a state from typeahead
3. Verify county/place prompt is displayed
4. Select a county or place
5. Verify description prompt is displayed
6. Type an issue description
7. Verify category suggestions are displayed
8. Select a category
9. Verify completion message and navigation

**Expected Result:**
- Each slot is filled in order
- Prompts reflect filled slots (e.g., "Which county in California?")
- All required slots are collected
- Flow completes and navigates to Issue Project

### 17. Slot Filling - Geography Only (Find Instance)
**Steps:**
1. From menu, type "find instance"
2. Select a state
3. Optionally select county/place
4. Verify completion transitions to discovery result

**Expected Result:**
- Geography slots are filled
- Flow completes when required slots are filled
- Transitions to discovery result view

### 18. Slot Filling - Create Instance Flow
**Steps:**
1. From menu, type "create instance"
2. Select a state
3. Select a county
4. Verify completion navigates to Create Instance page

**Expected Result:**
- State and county slots are filled
- Flow completes and navigates to Create Instance
- Widget closes

### 19. Repair Behavior - Change State Mid-Flow
**Steps:**
1. Start report issue intent flow
2. Select a state (e.g., "California")
3. Select a county
4. Type "actually, I meant Texas"
5. Verify Secretary detects repair
6. Verify county slot is cleared
7. Verify state selection prompt is shown again

**Expected Result:**
- Repair cue is detected
- Dependent slots (county, place) are cleared
- State slot is reset
- Flow continues from state selection

### 20. Repair Behavior - Change County
**Steps:**
1. Start report issue intent flow
2. Select a state
3. Select a county
4. Type "sorry, wrong county"
5. Verify Secretary detects repair
6. Verify place slot is cleared (if filled)
7. Verify county selection prompt is shown

**Expected Result:**
- Repair is detected
- Dependent place slot is cleared
- County slot is reset
- Flow continues from county selection

### 21. Slot Filling - Skip Optional Slots
**Steps:**
1. Start report issue intent flow
2. Select a state
3. Skip county/place (if optional for the intent)
4. Verify flow continues to next required slot

**Expected Result:**
- Optional slots can be skipped
- Flow advances to next required slot
- Completion triggers when all required slots are filled

### 22. Category Suggestions - Based on Geography Level
**Steps:**
1. Start report issue intent flow
2. Select a state
3. Enter an issue description
4. Verify suggestions are appropriate for state-level issues

**Expected Result:**
- Suggestions match the geography level (state/county/place)
- Suggestions are relevant to the description

### 23. Category Suggestions - Something Else
**Steps:**
1. Start report issue intent flow
2. Complete geography and description slots
3. View category suggestions
4. Click "Something else"
5. Enter a custom category
6. Verify flow completes

**Expected Result:**
- "Something else" button is available
- Custom category input is shown
- Custom category is accepted
- Flow completes successfully

### 24. Regression - Existing Discovery Flow
**Steps:**
1. Click "Discover Your City" from menu
2. Complete discovery flow using existing nodes
3. Verify no regressions in behavior

**Expected Result:**
- Existing discovery flow works as before
- No console errors
- All transitions work correctly

### 25. Regression - Existing Report Issue Flow
**Steps:**
1. Complete discovery flow first
2. Click "Report an Issue"
3. Complete report issue flow using existing nodes
4. Verify no regressions

**Expected Result:**
- Existing report issue flow works as before
- Top issues are loaded correctly
- Category selection works
- Navigation to Issue Project works

## Notes
- All tests should complete without console errors
- Intent/slot flows should feel natural and conversational
- Repair behavior should preserve non-dependent slots
- Geography typeahead should work consistently across both old and new flows
- Category suggestions should be relevant to the selected geography level
