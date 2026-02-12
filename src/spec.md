# Specification

## Summary
**Goal:** Provide consistent, reusable earned contribution-points toast feedback after successful contribution event logging.

**Planned changes:**
- Add a shared earned-points toast helper/component using the existing Sonner toaster to display “+<number> contribution points earned” with a 2–3s auto-dismiss.
- Update contribution logging flows to call the shared toast after `useContributionEventLogger().mutateAsync` resolves successfully with `isDuplicate === false`, replacing any ad-hoc earned-points toasts (at least in IssueProjectTasksTab).
- Derive any “updated total points” shown in the toast strictly from local React state/React Query cache (no backend fetch), and gracefully handle missing cached totals.
- Display distinct English toast copy per action type (ISSUE_CREATED, COMMENT_CREATED, EVIDENCE_ADDED) using the canonical frontend action type constants.
- Support a chat-origin context flag that switches the toast copy to Secretary-friendly English variants for the same action types.
- Add a simple centralized lock in the shared toast module to prevent duplicate earned-points toasts from appearing twice when triggers fire in quick succession (without affecting other toasts).

**User-visible outcome:** After logging a contribution event successfully, users see a brief points-earned toast (with action-appropriate messaging), shown once per rapid sequence and without any extra loading/fetching.
