# Specification

## Summary
**Goal:** Persist the Contribution Log and next log entry ID across Motoko canister upgrades using stable memory, without changing existing API behavior.

**Planned changes:**
- Update the contribution log storage in `backend/main.mo` to use stable-memory backed state (e.g., stable variables plus `preupgrade`/`postupgrade`, or an equivalent stable structure).
- Ensure the existing contribution logging APIs (`recordContribution`, `addContributionPoints`, `getCallerContributionHistory`, `getCallerContributionSummary`) continue to behave the same, except that data persists across upgrades.
- Preserve existing authorization behavior for recording/viewing caller contribution history/summary.
- Maintain bounded contribution history query responses (keep the existing limit behavior and avoid unbounded payloads).
- If needed, add a conditional upgrade migration that preserves existing stable state per repository policy.

**User-visible outcome:** After an upgrade, previously recorded contribution log entries remain available and the next contribution log entry ID continues without reuse.
