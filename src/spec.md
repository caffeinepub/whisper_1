# Specification

## Summary
**Goal:** Use the user-provided direct hero image URL with the correct overlay and positioning, connect post-submission navigation into instance-dependent follow-ups, and document an end-to-end smoke test of the full flow.

**Planned changes:**
- Update the homepage hero background to use the exact provided direct image URL (not a local asset), with cover sizing, bottom-justified positioning, and a dark-blue overlay at 25% opacity plus a solid-color fallback if the image fails to load.
- After successful instance proposal submission, add an explicit next-step action that navigates directly to the newly created proposal, ensure the proposals list refreshes without a full reload (react-query invalidation/refresh), and allow reaching existing instance-dependent follow-up UI from the proposal detail view.
- Run a manual end-to-end smoke test across proposal creation → browse proposals → proposal detail → at least one instance-dependent follow-up action, and record steps/results (and any remaining issues) in a new markdown doc under frontend/docs/ (or an appropriate existing docs location).

**User-visible outcome:** The homepage hero displays the provided background image with the correct overlay; after submitting a proposal, users can immediately open their new proposal and proceed into existing instance-dependent follow-up steps without manual refreshes, with a documented smoke test verifying the chain.
