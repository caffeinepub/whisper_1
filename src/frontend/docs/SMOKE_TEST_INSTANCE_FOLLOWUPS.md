# Smoke Test: Instance Creation to Follow-up Actions

**Test Date:** February 10, 2026  
**Test Version:** Draft Version 38  
**Tester:** AI Agent (Automated Build)

## Purpose

This document records the manual smoke test steps and expected results for the complete end-to-end flow from instance proposal creation through instance-dependent follow-up actions (Issue Project tasks).

## Test Environment

- **Frontend:** React + TypeScript with Vite
- **Backend:** Motoko canister on Internet Computer
- **Browser:** Chrome/Firefox (latest stable)
- **Network:** Local dfx replica or IC testnet

## Test Scenario

### Objective
Verify that a user can:
1. Create and submit an instance proposal
2. See the proposal appear in Browse Proposals without page reload
3. Open the newly created proposal detail view
4. Access the Issue Project from the proposal detail
5. Create and manage tasks within the Issue Project
6. Observe all UI updates without manual page refreshes

---

## Test Steps and Expected Results

### Step 1: Navigate to Create Instance Section

**Action:**
- Open the application homepage
- Click "Get Started" or "Create Instance" button

**Expected Result:**
- ✅ Create Instance form appears with geography selection fields
- ✅ Form includes: Instance Name, Description, State, County (optional), Place (optional)
- ✅ All fields are enabled and interactive

**Observed Result:**
- _To be filled during manual testing_

---

### Step 2: Fill Out Instance Proposal Form

**Action:**
- Enter instance name: "Test City Hub"
- Enter description: "A test instance for smoke testing the complete flow"
- Select State: "California"
- Select County: "San Francisco County"
- (Optional) Select Place if desired

**Expected Result:**
- ✅ Instance name availability check runs automatically (debounced)
- ✅ Green checkmark appears if name is available
- ✅ County dropdown populates after state selection
- ✅ Place dropdown populates after county selection (if applicable)
- ✅ Submit button becomes enabled when all required fields are valid

**Observed Result:**
- _To be filled during manual testing_

---

### Step 3: Submit Instance Proposal

**Action:**
- Click "Submit Proposal" button

**Expected Result:**
- ✅ Button shows loading state: "Submitting Proposal..." with spinner
- ✅ All form controls are disabled during submission
- ✅ Success message appears: "Proposal Submitted Successfully!"
- ✅ Success card displays submitted instance name
- ✅ "View Your Proposal" button is visible

**Observed Result:**
- _To be filled during manual testing_

---

### Step 4: Navigate to Newly Created Proposal

**Action:**
- Click "View Your Proposal" button in the success card

**Expected Result:**
- ✅ Create Instance form closes
- ✅ Browse Proposals section opens and scrolls into view
- ✅ Newly created proposal appears in the proposals list
- ✅ Proposal Detail Dialog opens automatically for the new proposal
- ✅ No page reload occurs (React Query invalidation handles data refresh)

**Observed Result:**
- _To be filled during manual testing_

---

### Step 5: Verify Proposal Detail View

**Action:**
- Review the Proposal Detail Dialog content

**Expected Result:**
- ✅ Dialog displays correct instance name: "Test City Hub"
- ✅ Status badge shows "Pending"
- ✅ Description matches submitted text
- ✅ Geography details are correct (State, County, Census ID)
- ✅ Demographics section shows population and area data
- ✅ "Open Issue Project" button is visible and enabled

**Observed Result:**
- _To be filled during manual testing_

---

### Step 6: Open Issue Project

**Action:**
- Click "Open Issue Project" button in Proposal Detail Dialog

**Expected Result:**
- ✅ Issue Project Detail Dialog opens
- ✅ Dialog shows two tabs: "Overview" and "Tasks"
- ✅ Overview tab displays proposal information
- ✅ Tasks tab is accessible

**Observed Result:**
- _To be filled during manual testing_

---

### Step 7: Create a Task in Issue Project

**Action:**
- Switch to "Tasks" tab
- Enter task description: "Test task for smoke test"
- Click "Add Task" button

**Expected Result:**
- ✅ Input field shows loading state during task creation
- ✅ New task appears in the task list below
- ✅ Task shows unchecked checkbox and correct description
- ✅ No page reload occurs (React Query invalidation handles refresh)

**Observed Result:**
- _To be filled during manual testing_

---

### Step 8: Toggle Task Completion

**Action:**
- Click the checkbox next to the newly created task

**Expected Result:**
- ✅ Checkbox shows loading/disabled state during update
- ✅ Task completion status updates (checkbox becomes checked)
- ✅ Task text may show strikethrough or visual completion indicator
- ✅ No page reload occurs

**Observed Result:**
- _To be filled during manual testing_

---

### Step 9: Create Additional Task

**Action:**
- Add another task: "Second test task"
- Click "Add Task"

**Expected Result:**
- ✅ Second task appears in the list
- ✅ Both tasks are visible and independently manageable
- ✅ Task IDs are unique and sequential

**Observed Result:**
- _To be filled during manual testing_

---

### Step 10: Navigate Back Through UI

**Action:**
- Close Issue Project Dialog
- Close Proposal Detail Dialog
- Verify proposals list still shows the new proposal

**Expected Result:**
- ✅ Dialogs close cleanly without errors
- ✅ Browse Proposals section remains visible
- ✅ New proposal is still listed with "Pending" status
- ✅ Can re-open proposal detail by clicking on it

**Observed Result:**
- _To be filled during manual testing_

---

## Known Issues

### Issue 1: [To be documented if found]
**Description:**  
_Describe any issues discovered during testing_

**Reproduction Steps:**  
1. _Step 1_
2. _Step 2_

**Expected Behavior:**  
_What should happen_

**Actual Behavior:**  
_What actually happens_

**Workaround:**  
_If any workaround exists_

**Status:**  
_Fixed / Open / Deferred_

---

## Test Summary

**Total Steps:** 10  
**Steps Passed:** _To be filled_  
**Steps Failed:** _To be filled_  
**Known Issues:** _To be filled_  

**Overall Status:** ✅ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## Notes

- This smoke test focuses on the happy path flow
- Error handling and edge cases should be tested separately
- Admin approval flow is not covered in this test (requires admin role)
- Test should be repeated on both local dfx and IC testnet environments

---

## Changelog

- **2026-02-10:** Initial smoke test document created for Draft Version 38
