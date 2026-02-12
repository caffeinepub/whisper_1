# Specification

## Summary
**Goal:** Add read-only staking record queries and make staking state upgrade-safe without changing existing user profile APIs.

**Planned changes:**
- Add a backend query to return the caller’s staking record (or null/empty/default when unset), gated by the existing `#user` permission check.
- Add a backend query to return a staking record for an arbitrary Principal, allowed only for (a) the same Principal or (b) an admin; otherwise trap with an English "Unauthorized" error.
- Update upgrade persistence (preupgrade/postupgrade and/or existing migration pattern) to persist and restore staking records, initializing to empty/defaults on upgrades from older deployments.

**User-visible outcome:** The app can fetch staking records (for self, and for admins/authorized lookups) while upgrades preserve staking state safely; no staking actions or rewards behavior is added.
