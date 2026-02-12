# Specification

## Summary
**Goal:** Display a clearly visible Contribution Points total on the Profile page, styled with a teal accent, sourced from existing client-side state, and updated instantly after points are earned.

**Planned changes:**
- Add a dedicated Contribution Points summary element/card to the Profile page with a prominently displayed total and teal-accent styling consistent with existing Profile components.
- Bind the displayed total to existing Profile page client-side state / React Query cache (no new backend calls or fetch hooks added solely for this display).
- Add English helper hint text explaining contribution points and an explicit English fallback message for users with zero points.
- Ensure the total updates immediately after an earned-points toast event by updating existing client-side state/React Query cache (without requiring a backend refetch for UI freshness).
- Verify and adjust layout/spacings so the Contribution Points element is mobile responsive (no overflow/clipping on small screens).

**User-visible outcome:** Users can see their total Contribution Points on their Profile page with a brief explanation, a clear zero-points message when applicable, and the total updates immediately after earning points.
