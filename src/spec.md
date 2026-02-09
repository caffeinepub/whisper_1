# Specification

## Summary
**Goal:** Complete Steps 8–9 by adding a reachable proposals list, proposal detail view, and a minimal approve/reject moderation flow with clear English loading/empty/error/success feedback.

**Planned changes:**
- Add navigation from the main app shell to a Proposals section/view that lists all Create Instance proposals from the backend with loading, empty, and error states.
- Add a proposal detail view accessible from each list item, showing instance name, proposer, description, and status with in-view loading/error handling.
- Add approve/reject controls in the proposal detail view for Pending proposals, including success/failure messages and UI updates without full page reload.
- Add backend validation for proposal status updates: only allow Pending → Approved/Rejected and reject unsupported statuses.
- Ensure the proposals list reflects updated statuses after a successful moderation action (via refetch/query invalidation).

**User-visible outcome:** Users can open a Proposals view from the app shell, browse proposals, open a proposal’s details, and (for Pending proposals) approve or reject them with immediate status updates and clear English feedback.
