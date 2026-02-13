# Specification

## Summary
**Goal:** Add an `issueDescription` multi-line textarea to the issue creation form and include it throughout the submission flow.

**Planned changes:**
- Add a clearly labeled (English) textarea field named `issueDescription` to the issue creation form UI.
- Ensure Enter inserts new lines in the textarea without accidentally submitting the form.
- Store `issueDescription` in the form’s internal state so it persists during the issue creation flow.
- If a review/confirmation step exists, display the entered `issueDescription` in the summary.
- Include `issueDescription` in the issue creation submission payload.

**User-visible outcome:** Users can enter a multi-line description for a new issue, see it preserved during the flow (and in any review step), and have it submitted with the issue.
