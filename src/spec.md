# Specification

## Summary
**Goal:** Add an `issueTitle` text field to the Secretary guided issue reporting draft and show it in the review/confirmation step.

**Planned changes:**
- Extend the guided report-issue draft state to include a new `issueTitle` (or `title`) string field defaulting to an empty string.
- Add a guided step that prompts the user (in English) to enter the issue title using the existing Secretary text input control and store it in the draft state.
- Update the guided report-issue confirmation/review UI to display the entered issue title alongside the existing Location/Category/Details summary.

**User-visible outcome:** Users can enter a short issue title during the guided issue reporting flow and see it included in the final review/confirmation summary.
