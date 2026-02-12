# Specification

## Summary
**Goal:** Add a backend read-only staking info query and display the caller’s staking details on the Profile page.

**Planned changes:**
- Backend: Expose a public Motoko query method `getStakingInfo` that returns the caller’s nullable `StakingRecord` from existing `stakingRecords` storage.
- Frontend: Add a React Query hook to fetch `getStakingInfo` (identity-scoped caching consistent with existing patterns) and ensure candid bindings include the new method.
- Frontend: Add a read-only “Staking” section on the Profile page showing Total Staked, Available Balance, Locked Balance, and Pending Rewards using the existing token amount formatter, plus loading and empty states.

**User-visible outcome:** On the Profile page, users can view their staking totals and balances (or see a loading state / an empty-state message if no staking record exists), with no stake/unstake actions available.
