# Smoke Test: Instance Followups

This document provides comprehensive manual smoke test documentation covering the complete end-to-end flow from proposal creation through Issue Project task management, with regression validation steps for all patched issues.

## Core Flow Tests

### 1. Proposal Creation
1. Navigate to home page
2. Click "Create Instance"
3. Select state, county, place
4. Verify auto-generated WHISPER- prefixed instance name
5. Enter description
6. Submit proposal
7. Verify success toast with earned points
8. Verify inline earned-points badge displays

### 2. Admin Moderation
1. Log in as admin
2. Navigate to Admin → Moderation
3. Verify proposal appears in queue
4. Approve proposal
5. Verify status updates to "Approved"
6. Verify proposal removed from queue

### 3. Issue Project Task Management
1. Navigate to Proposals
2. Click on approved proposal
3. Open Issue Project detail dialog
4. Navigate to Tasks tab
5. Create task with description
6. Verify task appears in list
7. Mark task complete
8. Verify task status updates
9. Verify earned-points toast and inline badge

### 4. Evidence Upload
1. In Issue Project detail dialog
2. Navigate to Evidence tab
3. Upload image file
4. Verify upload progress
5. Verify image preview displays
6. Verify earned-points toast and inline badge

## Regression Validation

### Patch 1: IconBubble Children Pattern
1. Navigate to Create Instance form
2. Verify icon bubble renders correctly (no console errors)
3. Verify icon is centered in bubble
4. Verify bubble has teal secondary variant styling

### Patch 2: UI Copy Property Names
1. Navigate to Create Instance form
2. Verify all labels display correctly (no "undefined")
3. Verify button text is "Submit Proposal"
4. Verify success toast shows correct message

### Patch 3: Proposal Detail Dialog Props
1. Open proposal detail dialog
2. Click on Issue Project
3. Verify Issue Project detail dialog opens (no console errors)
4. Verify no invalid 'proposal' prop warning

### Patch 4: Task Hooks proposalId Parameter
1. Open Issue Project detail dialog
2. Navigate to Tasks tab
3. Verify tasks load correctly (no "proposalId undefined" errors)
4. Create new task
5. Verify task creation succeeds

### Patch 5: TaskWithId Iteration
1. Open Issue Project detail dialog with multiple tasks
2. Navigate to Tasks tab
3. Verify all tasks render correctly
4. Verify each task shows id, description, completed status
5. Verify no iteration errors in console

## Hyperlocal Feed + Issues + Secretary (New)

### Feed Tests
1. Navigate to Feed page
2. Select location (state → county → place)
3. Verify displayed "Current Location" matches selection
4. Refresh page → verify location persists
5. Create post → verify appears in feed immediately
6. Switch to different location → verify post does NOT appear
7. Test pagination: create 25+ posts, scroll to load more
8. Test filters: create posts with different categories, apply filters

### Issue Tests
1. Navigate to Issues page
2. Click "Create Issue"
3. Fill title, description, category, select location
4. Upload optional photo
5. Submit → verify redirected to issue detail
6. Verify issue appears in list for that location
7. Test status transitions: claim issue, update status
8. Add progress note → verify appears in timeline
9. Navigate to Issue Map → verify marker appears

### Secretary Tests
1. Open Secretary widget
2. Say "Show me the feed" → verify navigates to Feed
3. Say "Create a post" → verify opens composer
4. Say "Report an issue" → verify starts guided flow
5. Complete guided issue report flow with location/category/description
6. Verify confirmation summary displays
7. Confirm → verify issue created
8. Test corrections: change category mid-flow

### Mobile Tests
1. Open app on mobile device or 360px viewport
2. Navigate to Feed → verify no horizontal scrolling
3. Create post → verify form fits screen
4. Scroll feed → verify smooth infinite scroll
5. Navigate to Issues → verify list cards stack vertically
6. Open issue detail → verify timeline readable
7. Navigate to Issue Map → verify map + filters usable

## Base Path Deployment Validation

### Static Asset Loading
1. Deploy to non-root base path (e.g., `/whisper/`)
2. Verify hero image loads correctly
3. Verify logo SVG loads correctly
4. Verify all static assets resolve with base path

### Client-Side Navigation
1. Click navigation links (Home, Feed, Issues, Tasks, Profile)
2. Verify URLs include base path
3. Verify browser back/forward buttons work
4. Verify direct URL access works (e.g., `/whisper/feed`)

### Secretary Widget Functionality
1. Open Secretary widget
2. Verify widget renders correctly
3. Test navigation commands → verify base-path-safe navigation
4. Test discovery flow → verify works under non-root base path

### Secretary-Triggered Navigation
1. Open Secretary
2. Navigate to proposal by name
3. Verify proposal detail dialog opens
4. Navigate to Issue Project
5. Verify Issue Project detail dialog opens
6. Verify all navigation respects base path

## Performance Checks

### Feed Performance
1. Create 100+ posts in instance
2. Load feed page
3. Verify initial load < 2 seconds
4. Scroll through feed
5. Verify no jank or stuttering
6. Verify infinite scroll triggers smoothly

### Map Performance
1. Create 50+ issues with coordinates
2. Load Issue Map page
3. Verify markers render < 3 seconds
4. Pan and zoom map
5. Verify smooth interaction
6. Apply filters → verify quick update

## Error Handling

### Network Errors
1. Disconnect network
2. Attempt to create post
3. Verify user-friendly error message
4. Reconnect network
5. Retry → verify succeeds

### Validation Errors
1. Attempt to create post with empty content
2. Verify error message: "Post content cannot be empty"
3. Attempt to create issue with empty title
4. Verify error message: "Task title cannot be empty"

### Authorization Errors
1. Log out
2. Attempt to create post
3. Verify error message: "Unauthorized: Only users can create posts"
4. Log in
5. Retry → verify succeeds

## Accessibility Checks

### Keyboard Navigation
1. Tab through Feed page
2. Verify all interactive elements reachable
3. Press Enter on post card → verify opens detail
4. Press Escape → verify closes dialog

### Screen Reader
1. Enable screen reader
2. Navigate to Feed page
3. Verify location selector announces correctly
4. Verify post cards announce author, content, timestamp
5. Verify buttons announce action (e.g., "Create Post")

## Conclusion

This comprehensive smoke test suite covers all core functionality, regression validation, new features (feed, issues, Secretary), mobile optimization, base path deployment, performance, error handling, and accessibility. Run these tests after each build to ensure quality and catch regressions early.
