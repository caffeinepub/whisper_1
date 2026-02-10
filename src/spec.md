# Specification

## Summary
**Goal:** Update deployment documentation to include a clean rebuild + redeploy procedure and troubleshooting guidance for intermittent Caffeine draft deployment issues.

**Planned changes:**
- Update `frontend/docs/DEPLOYMENT.md` with a clearly labeled “clean rebuild and redeploy” section describing concrete steps to clear local build artifacts/caches, then rebuild and redeploy.
- Add a troubleshooting section to `frontend/docs/DEPLOYMENT.md` covering intermittent platform-level draft deployment failures, including retry guidance via clean rebuild/redeploy.
- Document the known draft preview console error `draft-editor:error disallowed origin: https://just-olive-eim-draft.caffeine.xyz` as a platform preview issue (not application code), ensuring all added/updated text is in English.

**User-visible outcome:** Developers can follow updated deployment docs to perform a clean rebuild and redeploy, and can reference troubleshooting notes for intermittent draft deployment/preview issues.
