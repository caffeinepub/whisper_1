# Specification

## Summary
**Goal:** Connect contribution rewards to issue-flow actions so points/reward types are determined and logged by the backend when users create issues, add comments, or upload evidence.

**Planned changes:**
- Add a centralized backend mapping of issue-flow actionType -> {points, rewardType} for issue creation, comment creation, and evidence upload (backend as source of truth).
- Implement/extend a single backend entrypoint to record contribution events by (actionType, optional referenceId, optional details), validate inputs, resolve rewards from the mapping, write a ContributionLogEntry, and return the created log entry id.
- Add backend guardrails: reject unknown actionTypes, enforce required/valid referenceId where needed, apply basic input bounds, and dedupe awards for the same (caller, actionType, referenceId).
- Update the frontend to call the backend contribution-event entrypoint after successful issue creation, comment creation, and evidence upload, passing the correct actionType and a stable referenceId.
- After logging a contribution event, invalidate/refetch the caller contribution summary React Query cache so totals refresh.

**User-visible outcome:** After creating an issue, creating a comment, or uploading evidence, the user’s contribution rewards are recorded once per action (with backend deduplication) and contribution totals refresh on pages that display them.
