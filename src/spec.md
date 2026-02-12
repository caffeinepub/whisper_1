# Specification

## Summary
**Goal:** Add embedded WSP (ICRC-1-style) token accounting with mint/burn support, basic balance display in the Profile UI, frontend-only staking fields, backend governance stubs, and admin token operation controls.

**Planned changes:**
- Implement an embedded ICRC-1-style WSP ledger inside the existing backend single actor, including persistent balances, total supply, and public methods (name/symbol/decimals, total_supply, balance_of, transfer).
- Add idempotent WSP minting tied to accepted (non-duplicate) contribution events, using a deterministic conversion rule.
- Add admin-only burn/slash logic to invalidate contribution events or slash users, burn corresponding WSP (up to available balance), and store an auditable record of these actions.
- Add backend governance scaffolding (types and placeholder methods) that compiles and returns a clear “not implemented” result without unexpected state changes.
- Update the Profile page to fetch and display the caller’s WSP balance from the backend ledger alongside existing contribution points, with loading/error handling and consistent formatting.
- Add a frontend-only “Staking” section on the Profile page with inputs (e.g., amount and optional lock/term selector) and client-side validation; do not persist to backend profile payload.
- Add an admin-only “Token Operations (Test Mode)” section in the Admin UI to mint/burn WSP for a specified principal via admin-gated backend methods, with English success/failure feedback and cache invalidation/refetch after operations.

**User-visible outcome:** Users can view their on-chain-style WSP balance on their Profile and enter staking details locally; admins can mint/burn WSP for specific principals from the Admin area, while token transfers and governance stubs are available via backend methods.
