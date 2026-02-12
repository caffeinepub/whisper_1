# Specification

## Summary
**Goal:** Add an admin-only “Contribution Logs” section in the Admin area to inspect contribution log entries with filters, pagination, and links to related entities.

**Planned changes:**
- Add a new Admin page section labeled “Contribution Logs” with English-only user-facing text.
- Fetch contribution logs via existing admin-only backend endpoints and render results incrementally (paginated), avoiding loading all entries at once.
- Display log entries in a simple, scannable list showing: user (principal), action type, points, and human-readable timestamp, with mobile-friendly layout for long principals.
- Add filters for action type and date (from/to or range) and apply them to the displayed results, including a clear empty state when no matches.
- Add pagination controls (next/previous or page navigation) and clearly indicate the current page/range; ensure pagination behaves sensibly when filters change.
- When a log entry has a reference identifier, link to the related issue/comment/evidence using existing navigation routes; show non-clickable text when it can’t be linked.
- Enforce admin gating so only admins can access the section: prompt unauthenticated users to log in, show access denied for non-admins, and prevent any log-fetch calls when not an admin.
- Ensure responsive layout and consistent admin styling, including loading/error/empty states.

**User-visible outcome:** Admins can open “Contribution Logs” in the Admin area, filter and page through contribution logs, and navigate to related items from log entries; non-admins cannot access or load log data.
