# Specification

## Summary
**Goal:** Let users choose or detect their location and consistently scope the app to a single neighborhood-based Whisper instance.

**Planned changes:**
- Add a manual location selector using existing U.S. geography data and hooks (State → County → optional Place) and derive a canonical `locationId` from the selected entity’s `hierarchicalId` (prefer place over county over state).
- Add a location acquisition flow that offers “Use my current location” via the browser Geolocation API, with clear fallback to manual selection when unavailable/denied/errors.
- Deterministically map the active `locationId` to exactly one `instanceName` using existing WHISPER- naming utilities, use it for Feed and PostComposer, and persist/restore the chosen `locationId` locally so the same local instance opens by default on subsequent visits.

**User-visible outcome:** Users can set their local area (automatically via device location when allowed, or manually via a state/county/place picker), and the app will show and post to the matching local Whisper feed consistently across refreshes until they change it.
