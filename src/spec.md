# Specification

## Summary
**Goal:** Add profile routes and UI screens for viewing and editing the authenticated user’s profile using the existing popstate-based navigation.

**Planned changes:**
- Add two navigable routes using the existing pathname + popstate approach: `/profile` (read-only) and `/profile/edit` (edit form), reachable from the existing header/user menu.
- Implement `/profile` view in a clean, mobile-first layout showing: avatar (with fallback), display name, handle, bio, role/badges, location, join date, contribution stats, external links, and recent activity summary; use placeholders/empty states for fields not available from the backend.
- Implement `/profile/edit` form UI to update: display name, bio, avatar upload/removal (keeping existing validations), 1–3 external links, and preferences controls (UI-only if persistence isn’t supported yet); provide Save/Cancel with return to `/profile`, and refresh/reflect updated name/avatar after save.
- Show an authentication-required state (with login action) when unauthenticated users visit `/profile` or `/profile/edit`.

**User-visible outcome:** Signed-in users can navigate to a profile page to view their details and to an edit page to update their name and avatar (and edit additional fields in the UI), while signed-out users are prompted to log in when accessing these routes.
