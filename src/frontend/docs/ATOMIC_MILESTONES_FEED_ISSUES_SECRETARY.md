# Atomic Milestones: Hyperlocal Feed + Civic Issues + Secretary/Map Integration

This document defines ordered, independently testable milestones (M1–M17) for implementing the hyperlocal feed, structured civic task engine, and AI Secretary/map integration features in Whisper.

## Constraints & Guidelines

- **Backend**: Single Motoko actor with stable-memory persistence (no external databases)
- **Authentication**: Internet Identity only (no OAuth/email-password)
- **Real-time**: No WebSockets; use React Query invalidation for updates
- **Location**: Manual selection required; browser geolocation optional
- **Immutable paths**: Do not edit files marked immutable; compose around them

---

## M1: Foundation - Location/Instance Selection Flow

**Scope**: Verify and document frontend location/instance selection flow and ensure Feed page uses the persisted selection consistently.

### Frontend Changes
- Tighten consistency between displayed location, derived instanceName, and feed query usage in `FeedPage.tsx`
- Add JSDoc notes in `useInstanceScopeLocation.ts` explaining localStorage keys and persistence
- Document feed query key shape in `useInstanceFeed.ts`
- Add architecture section in `ARCHITECTURE.md` describing instance scope on frontend

### Backend Changes
None (uses existing geography data and instance naming)

### Smoke Test
1. Navigate to Feed page
2. Select a location (state → county → place)
3. Verify displayed "Current Location" matches selection
4. Refresh page
5. Verify location persists and feed query uses correct instanceName
6. Change location and verify feed updates

---

## M2: Feed Pagination (Backend)

**Scope**: Backend exposes a query method that matches the frontend calling pattern in useInstanceFeed (instanceName, limit, offset).

### Frontend Changes
None (frontend already implements pagination via `useInstanceFeed`)

### Backend Changes
Already implemented: `getPostsByInstance(instanceName, limit, offset)` returns posts ordered newest-first

### Smoke Test
1. Create 25+ posts in instance A
2. Load feed page for instance A
3. Verify first page shows 20 posts (newest first)
4. Scroll to trigger next page load
5. Verify next 5 posts load without duplicates
6. Switch to instance B (no posts)
7. Verify empty state displays

---

## M3: Create Post + Instance Scoping

**Scope**: Ensure post creation UX is instance-scoped and refreshes the correct feed via React Query invalidation.

### Frontend Changes
- Fix cache invalidation in `useCreatePost.ts` to match feed query key `['feed', instanceName]`
- Ensure `PostComposer.tsx` is clearly instance-scoped when instanceName provided
- Update `FeedPage.tsx` to ensure feed updates after post creation without reload

### Backend Changes
Already implemented: `createPost` stores posts with instanceName

### Smoke Test
1. Navigate to Feed for instance A
2. Create a post with content "Test post A"
3. Verify post appears in feed immediately (no reload)
4. Navigate to Feed for instance B
5. Verify "Test post A" does NOT appear
6. Create post "Test post B" in instance B
7. Verify only "Test post B" appears in instance B feed

---

## M4: Feed Interactions v1 (Like/Comment)

**Scope**: Add minimal like/unlike and threaded comments UI on post detail view, wired through new hooks.

### Frontend Changes
- Create `usePostInteractions.ts` with React Query hooks for like/unlike, list comments, add comment, reply
- Extend `PostDetailDialog.tsx` to render likes & comments section with one-level nesting
- Add lightweight interaction affordances on `PostCard.tsx` (like count, comment count)

### Backend Changes
**MISSING**: Backend does not yet support post likes or comments. Need:
- `likePost(postId)` mutation
- `unlikePost(postId)` mutation
- `addComment(postId, content)` mutation
- `addReply(commentId, content)` mutation
- `getComments(postId)` query

### Smoke Test
1. Open post detail dialog
2. Click like button → verify count increments
3. Click unlike → verify count decrements
4. Add comment "Test comment"
5. Verify comment appears with timestamp and author
6. Reply to comment → verify reply appears nested
7. Verify guest users can view but not interact

---

## M5: Moderation v1 (Report/Hide/Admin Review)

**Scope**: Ensure report/hide UX is present for users and admin review actions are accessible in Admin UI.

### Frontend Changes
- Confirm `FlagPostDialog.tsx` supports optional reason and auth gating
- Ensure `useFlagPost.ts` invalidates feed and post detail caches
- Complete `FlaggedPostsSection.tsx` with pagination, clear/delete confirmation, admin-only rendering

### Backend Changes
Already implemented: `flagPost`, `clearFlag`, `deletePost`, `getFlaggedPosts`

### Smoke Test
1. As user, report a post with reason "Spam"
2. Verify post is flagged (shows in admin queue)
3. As admin, navigate to Admin → Flagged Posts
4. Verify flagged post appears with reason
5. Click "Clear Flag" → verify post removed from queue
6. Flag another post, click "Delete" → verify post removed from feed
7. As non-admin, verify cannot access admin moderation APIs

---

## M6: Feed Categorization + Filters

**Scope**: Add category selection to post creation and filter controls that alter the feed query key.

### Frontend Changes
- Create `postCategories.ts` defining categories (news, events, lost-and-found, general)
- Add category control to `PostComposer.tsx` (default 'general')
- Add filter controls to `FeedList.tsx` above list
- Extend `useInstanceFeed.ts` to accept optional filter params and incorporate into queryKey

### Backend Changes
**MISSING**: Backend does not persist or filter by category. Need:
- Add `category` field to `Post` type
- Update `createPost` to accept category
- Update `getPostsByInstance` to accept optional category filter

### Smoke Test
1. Create post with category "news"
2. Create post with category "events"
3. Apply "news" filter → verify only news post shows
4. Apply "events" filter → verify only events post shows
5. Clear filter → verify both posts show
6. Verify filter state persists in query key (separate cache per filter)

---

## M7: Feed Relevance Scoring (Backend)

**Scope**: Backend includes a documented scoring function and returns posts in a predictable order.

### Frontend Changes
None (frontend already handles ordered results)

### Backend Changes
**MISSING**: Backend does not implement relevance scoring. Need:
- Add scoring function considering recency, likes, comments, proximity
- Document scoring algorithm
- Ensure pagination remains consistent

### Smoke Test
1. Create post A (no engagement)
2. Wait 1 minute
3. Create post B, add 5 likes and 3 comments
4. Verify post B ranks above post A despite being newer
5. Verify pagination does not duplicate posts

---

## M8: Map Pin for Posts

**Scope**: Add optional manual coordinate selection UI in composer and show location badge on posts.

### Frontend Changes
- Create `MapPinPickerDialog.tsx` for manual pin selection (no GPS requirement)
- Integrate into `PostComposer.tsx` to add/remove optional pin
- Render location badge on `PostCard.tsx` when coordinates exist
- Show location badge/preview in `PostDetailDialog.tsx`

### Backend Changes
**MISSING**: Backend does not store coordinates. Need:
- Add optional `coordinates: { lat: Float; lng: Float }` field to `Post` type
- Update `createPost` to accept optional coordinates

### Smoke Test
1. Open post composer
2. Click "Add location pin"
3. Select coordinates on map
4. Verify badge shows "Pinned location"
5. Submit post
6. Verify post card shows location badge
7. Open post detail → verify location badge/preview displays
8. Create post without pin → verify no badge shows

---

## M9: Civic Issues Create Flow (Frontend)

**Scope**: Add issue submission UI (title, description, category, location, optional photos) plus list/detail views.

### Frontend Changes
- Create `IssuesListPage.tsx` with instance-scoped list
- Create `IssueCreatePage.tsx` with submission form and evidence upload
- Create `IssueDetailPage.tsx` showing all fields and timeline placeholder
- Create `useIssues.ts` with React Query hooks
- Wire pages into `App.tsx` routing
- Add "Issues" navigation entry to `HomeHeader.tsx`

### Backend Changes
**MISSING**: Backend does not have issue submission. Need:
- Define `Issue` type with title, description, category, locationId, status, evidence
- `createIssue` mutation
- `getIssuesByLocation` query
- `getIssue` query

### Smoke Test
1. Navigate to Issues page
2. Click "Create Issue"
3. Fill title, description, category, select location
4. Upload optional photo
5. Submit
6. Verify redirected to issue detail page
7. Verify issue appears in list for that location
8. Navigate to different location → verify issue does NOT appear

---

## M10: Auto-Routing to Instance (Frontend)

**Scope**: Ensure issue creation derives and stores routed instance scope from selected geography.

### Frontend Changes
- Update `IssueCreatePage.tsx` to derive instanceName from selected geography using `whisperInstanceNaming`
- Update `IssuesListPage.tsx` to scope list query by derived instanceName
- Add helper in `instanceScope.ts` to derive canonical instanceName

### Backend Changes
Already implemented: Backend stores locationId on tasks/issues

### Smoke Test
1. Create issue selecting place "Seattle"
2. Verify issue routed to "WHISPER-WA-KING-SEATTLE" instance
3. Create issue selecting county "King County"
4. Verify issue routed to "WHISPER-WA-KING" instance
5. Browse issues for Seattle → verify both issues appear
6. Browse issues for different county → verify neither issue appears

---

## M11: Issue Lifecycle + Assignments (Frontend)

**Scope**: Add status display and role-aware assignment/status action controls.

### Frontend Changes
- Create `issueLifecycle.ts` defining status enum and allowed transitions
- Update `IssueDetailPage.tsx` with status badge, transition controls, self-claim button, admin-assign input
- Add mutation hooks in `useIssues.ts` for status/assignment updates with optimistic UI

### Backend Changes
Already implemented: `updateTask` supports status updates, backend has `TaskStatus` enum

### Smoke Test
1. Create issue (status: open)
2. As user, click "Claim" → verify status changes to in_progress and assignee set
3. As admin, assign to different user → verify assignee updates
4. Update status to resolved → verify status badge updates
5. Attempt invalid transition (resolved → open) → verify error message
6. As non-admin, verify cannot access admin-assign controls

---

## M12: Issue Updates + Transparency Log (Frontend)

**Scope**: Add timeline UI to display immutable history entries and create update-entry UI.

### Frontend Changes
- Create `IssueHistoryTimeline.tsx` rendering chronological history
- Create `IssueUpdateComposer.tsx` for progress notes/comments and evidence upload
- Wire into `IssueDetailPage.tsx`
- Add hooks in `useIssues.ts` for listing history and creating updates

### Backend Changes
Already implemented: Backend stores `history` array on `StructuredCivicTask`

### Smoke Test
1. Open issue detail
2. Verify timeline shows "Task created" entry
3. Update status → verify new timeline entry appears with timestamp and actor
4. Add progress note "Working on it" → verify appears in timeline
5. Upload evidence → verify appears as timeline entry
6. Verify all entries show actor name (via profile lookup)

---

## M13: Issue Map View (Frontend)

**Scope**: Add instance-level map view with markers for issues that have coordinates.

### Frontend Changes
- Create `IssueMapPage.tsx` with map rendering markers for issues with coordinates
- Create `SimpleMarkerMap.tsx` reusable map component
- Add status/category filters
- Wire into `App.tsx` routing
- Add "Issue Map" navigation entry to `HomeHeader.tsx`

### Backend Changes
None (uses existing issue queries)

### Smoke Test
1. Create 3 issues with coordinates in instance A
2. Navigate to Issue Map for instance A
3. Verify 3 markers appear
4. Click marker → verify opens issue detail
5. Apply status filter "open" → verify only open issues show
6. Apply category filter "potholes" → verify only pothole issues show
7. Navigate to instance B → verify no markers (no issues)

---

## M14: Secretary Hooks - Navigation

**Scope**: Register Secretary destinations for feed, create post, report issue, and issue map.

### Frontend Changes
- Create `registerSecretaryDestinations.ts` composing destination registrations
- Update `App.tsx` to call registration helper
- Add destinations: feed, create post, report issue, issue map
- Integrate event-based navigation for at least one destination

### Backend Changes
None

### Smoke Test
1. Open Secretary widget
2. Say "Show me the feed"
3. Verify navigates to Feed page
4. Say "Create a post"
5. Verify opens post composer
6. Say "Report an issue"
7. Verify opens issue creation flow
8. Say "Show issue map"
9. Verify navigates to Issue Map page

---

## M15: Secretary Guided Creation Flows (Frontend)

**Scope**: Implement guided slot-filling for creating a feed post and reporting an issue.

### Frontend Changes
- Extend `flowRegistry.ts` with 'create post' and 'report issue' guided flows
- Extend `flows.ts` with guided flow nodes and category suggestion display
- Ensure `useComplaintSuggestions.ts` supports guided flow needs
- Wire completions in `FlowEngineBrain.ts` to mutations/navigations
- Replace placeholders in `secretaryReportIssueData.ts` with real integrations

### Backend Changes
Already implemented: `getComplaintCategoriesByGeographyLevel` for category suggestions

### Smoke Test
1. Open Secretary
2. Say "I want to report an issue"
3. Secretary asks for location → provide "Seattle"
4. Secretary shows category suggestions → select "Potholes"
5. Secretary asks for description → provide "Large pothole on Main St"
6. Secretary shows confirmation summary
7. Confirm → verify issue created and appears in list
8. Repeat for "Create a post" flow
9. Verify corrections work (change category mid-flow)

---

## M16: Duplicate Checks for Issue Reporting (Frontend)

**Scope**: Add Secretary-guided duplicate detection step that searches issues within current instance.

### Frontend Changes
- Create `issueDuplicateCheck.ts` helper for scoped duplicate search
- Add guided node in `flows.ts` that runs duplicate check after location+description
- Render selectable list with "View existing" vs "Proceed anyway"
- Wire navigation in `App.tsx` from duplicate results to IssueDetailPage

### Backend Changes
**MISSING**: Backend does not support duplicate search. Need:
- `searchIssues(locationId, searchTerm)` query returning matching issues

### Smoke Test
1. Create issue "Pothole on Main St" in Seattle
2. Start Secretary flow to report issue
3. Provide location "Seattle" and description "Pothole on Main Street"
4. Verify Secretary shows "Found similar issue: Pothole on Main St"
5. Click "View existing" → verify navigates to existing issue
6. Restart flow, click "Proceed anyway" → verify creates new issue
7. Verify duplicate check does not run without location context

---

## M17: Mobile Optimization Pass

**Scope**: Improve mobile-first layouts and performance across feed, composer, issues pages, and map views.

### Frontend Changes
- Audit and adjust `FeedList.tsx` spacing and infinite scroll performance
- Improve `PostCard.tsx` mobile tap targets and prevent overflow
- Improve `PostComposer.tsx` form layout for mobile (stack controls, fit 360px)
- Ensure `IssuesListPage.tsx` list cards are mobile-friendly
- Ensure `IssueDetailPage.tsx` timeline and actions render without clipping
- Ensure `IssueMapPage.tsx` map + filters work on mobile
- Add global utility styles in `index.css` to prevent mobile overflow

### Backend Changes
None

### Smoke Test
1. Open app on mobile device or 360px viewport
2. Navigate to Feed → verify no horizontal scrolling
3. Create post → verify form fits screen, buttons reachable
4. Scroll feed → verify smooth infinite scroll (no jank)
5. Navigate to Issues → verify list cards stack vertically
6. Open issue detail → verify timeline readable, actions accessible
7. Navigate to Issue Map → verify map + filters usable on mobile
8. Test all primary actions (create post, report issue, filters) on mobile

---

## Summary

These 17 milestones provide an ordered, atomic path to implementing the hyperlocal feed, structured civic task engine, and AI Secretary/map integration. Each milestone is independently testable and includes clear frontend/backend scope plus manual smoke tests.

**Key Dependencies**:
- M1–M3: Foundation (location, pagination, post creation)
- M4–M8: Feed enhancements (interactions, moderation, categories, scoring, map pins)
- M9–M13: Civic issues (create, routing, lifecycle, updates, map view)
- M14–M16: Secretary integration (navigation, guided flows, duplicate checks)
- M17: Mobile optimization (cross-cutting)

**Backend Gaps** (documented in each milestone):
- M4: Post likes/comments APIs
- M6: Post category persistence and filtering
- M7: Relevance scoring algorithm
- M8: Post coordinates storage
- M9: Issue submission APIs
- M16: Issue duplicate search API
