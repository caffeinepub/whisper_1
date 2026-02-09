# Specification

## Summary
**Goal:** Improve discoverability of the existing Secretary widget by adding a small, non-intrusive greeting/tooltip with a clear action to open it.

**Planned changes:**
- Add a front-page greeting/tooltip in the main app shell (e.g., near header actions and/or near the floating Secretary button) that appears on first visit or until dismissed.
- Include an explicit English call-to-action referencing the Secretary feature and a clickable control that opens the existing Secretary widget.
- Add a user-dismissible close control with accessible labeling, keyboard operability, and visible focus states.
- Persist the dismissed state client-side so the greeting/tooltip stays dismissed across page reloads.
- Implement styling using existing Tailwind + shadcn components/tokens to match the established civic theme (no new color palette).

**User-visible outcome:** First-time visitors see a subtle tip pointing them to the Secretary feature and can click it to open the widget; once dismissed, the tip will no longer appear for that user on reload.
