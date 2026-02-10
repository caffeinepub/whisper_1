# Specification

## Summary
**Goal:** Improve the homepage hero’s visual impact and readability, refine the Secretary widget UI for clearer hierarchy, and add an extensible navigation/deep-link hook system so the Secretary can route users to pages or in-page features.

**Planned changes:**
- Replace the homepage hero background with an updated photorealistic real-life community collaboration/efficiency image from `frontend/public/assets/generated`, ensuring responsive `object-cover` behavior without hiding key subjects.
- Refine the hero overlay gradient and any subtle image treatment so the photo remains recognizable while preserving strong headline/subtext readability across breakpoints.
- Apply hero/UI polish: improve headline contrast/pop, adjust hero spacing/layout, and refine CTA button styling (hover, shadows, borders) consistent with the existing style system.
- Refine the Secretary widget’s readability and hierarchy: tune background/blur, improve assistant vs user bubble contrast, and adjust typographic hierarchy (header, quick actions label, message text).
- Add a documented, extensible hook + registry pattern for navigation/deep-link destinations so the Secretary can trigger URL-based deep links and in-page section toggles, and demonstrate it end-to-end with at least one existing Secretary action.

**User-visible outcome:** The homepage hero looks more photorealistic and clear with readable text and polished CTAs; the Secretary widget is easier to read with clearer message hierarchy; and the Secretary can direct users to supported pages or in-page sections via a reusable navigation hook system.
