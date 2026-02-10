# Smoke Test: Instance Creation and Issue Project Workflow

This document provides a comprehensive manual smoke test for the end-to-end flow from proposal creation through Issue Project task management, now extended to include regression validations.

## Prerequisites
- Backend deployed with geography data ingested
- At least one admin user assigned (first user becomes admin automatically)
- Test with both admin and non-admin users

## Test Flow

### 1. Proposal Creation
1. Navigate to home page
2. Scroll to "Get Started" section or click "Get Started" in header
3. Click "Open Secretary" button
4. In Secretary widget, select "Create Instance"
5. Fill in proposal form:
   - Select state (e.g., "California")
   - Select county (e.g., "Los Angeles County")
   - Enter description (e.g., "Community engagement platform for LA")
6. Click "Submit Proposal"
7. **Expected**: Success message appears
8. **Expected**: Proposal appears in proposals list

### 2. Admin Moderation
1. Log in as admin user
2. Navigate to Admin → Moderation page
3. **Expected**: Newly created proposal appears in moderation queue
4. Click "Approve" on the proposal
5. **Expected**: Proposal status changes to "Approved"
6. **Expected**: Proposal removed from moderation queue

### 3. Issue Project Creation (via Secretary)
1. Open Secretary widget
2. Select "Report an Issue"
3. Select geography (state/county/place)
4. Enter issue description (e.g., "pothole on main street")
5. **Expected**: Category suggestions appear
6. Select a category (e.g., "Road Potholes")
7. **Expected**: Success message
8. **Expected**: Navigates to proposals section
9. **Expected**: Proposal detail dialog opens with selected category badge

### 4. Task Management
1. In proposal detail dialog, click "Tasks" tab
2. Enter task description (e.g., "Inspect pothole location")
3. Click "Add Task"
4. **Expected**: Task appears in list immediately
5. **Expected**: Task shows as incomplete (unchecked)
6. Click checkbox to complete task
7. **Expected**: Task shows as complete (checked, strikethrough)
8. Add multiple tasks and toggle completion
9. **Expected**: Each task updates independently
10. **Expected**: No full page reloads

### 5. Regression Validations

#### Header Logo (Regression 1)
1. While on home page, verify logo appears in header (desktop and mobile)
2. **Expected**: Logo visible next to "Whisper" text
3. If logo fails to load, text remains visible

#### Hover Colors (Regression 2)
1. Hover over navigation links in header
2. **Expected**: Hover color is accent (not black)

#### Profile Load/Save (Regression 3)
1. Navigate to Profile page
2. **Expected**: Profile loads without "Actor not available" error
3. Edit name and save
4. **Expected**: Save succeeds
5. Log out and log back in
6. **Expected**: Profile loads correctly

#### Back to Home Navigation (Regression 4)
1. From Profile or Geography page, click "Back to Home"
2. **Expected**: Navigates to home page without full reload
3. **Expected**: Browser back/forward buttons work correctly

#### Secretary Geography Suggestions (Regression 5)
1. Open Secretary → "Report an Issue"
2. Select different geography levels (state/county/place)
3. **Expected**: Suggestions change based on selected level
4. **Expected**: No errors or blank suggestion lists

## Issue Tracking Template

If any test fails, document using this template:

**Test Step**: [e.g., "Task Management - Add Task"]  
**Expected Behavior**: [What should happen]  
**Actual Behavior**: [What actually happened]  
**Severity**: ☐ Critical ☐ High ☐ Medium ☐ Low  
**Screenshots/Logs**: [Attach if available]  
**Reproducible**: ☐ Always ☐ Sometimes ☐ Once  

---

**Test Date**: _______________  
**Tester**: _______________  
**Environment**: ☐ Local ☐ Testnet ☐ Mainnet  
**Overall Status**: ☐ Pass ☐ Fail  

**Notes**:
