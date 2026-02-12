# Specification

## Summary
**Goal:** Connect the existing proposals UI to real backend data, add working staking and governance proposal functionality end-to-end, and expand Secretary navigation to route to proposals and deep-link into a specific proposal.

**Planned changes:**
- Implement backend query/update methods for proposals and wire existing React Query hooks in `ProposalsSection` and `ProposalDetailDialog` to use real canister calls (preserving current loading/empty/error states).
- Add backend staking methods (`getStakingInfo`, `stake(amount)`, `unstake(amount)`) and connect them to the existing staking UI/hooks, replacing placeholder “not implemented” errors and ensuring state refresh after successful actions.
- Build governance proposals UI (create, list, detail, vote) and implement corresponding authenticated backend methods with persisted canister state; reuse existing UI component patterns and provide English success/error feedback.
- Expand Secretary routing/keyword registry to support navigating to the proposals view and opening a specific proposal detail dialog when a proposal identifier/name is provided, with graceful not-found handling.

**User-visible outcome:** Users see proposals populated from live backend data and can open proposal details; authenticated users can stake/unstake successfully and see balances update; users can create and vote on governance proposals; the Secretary can navigate to proposals and open a specific proposal when requested.
