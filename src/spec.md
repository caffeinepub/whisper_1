# Specification

## Summary
**Goal:** Add Secretary-specific backend query endpoints for geography lookups, issue/category retrieval, and similar-city search; update the Secretary UI to check instance availability via backend calls; and prevent blank/white screens by adding a top-level error boundary.

**Planned changes:**
- Add new Secretary-specific Motoko query endpoints to fetch a single geography record by hierarchicalId: getStateById, getCountyById, getCityById (read-only; no changes to existing geography endpoints/data).
- Add a Secretary-specific Motoko query endpoint getTop50IssuesForLocation to return the top-50 issue/category strings for a given level (place/county/state) using existing in-canister category lists, with safe defaults for unsupported/not-found inputs.
- Add a Motoko query endpoint searchSimilarCityNames to return a bounded list of matching places from existing geography data (case-insensitive; safe behavior for empty/very short inputs).
- Update the Secretary frontend to determine instance availability by calling the backend (based on the canonical computed instance name) instead of scanning all proposals client-side, and route users to view-existing vs create-instance flow accordingly.
- Add a top-level React error boundary with an English fallback screen instructing the user to refresh, including coverage for errors thrown during lazy imports.

**User-visible outcome:** The Secretary widget can look up states/counties/cities and top issues via dedicated backend queries, search for similar city names, reliably determine whether an instance already exists before routing, and shows a friendly fallback message instead of a blank screen if a runtime error occurs.
