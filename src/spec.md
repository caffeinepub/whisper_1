# Specification

## Summary
**Goal:** Prevent Caffeine draft preview pages from showing a blank screen by blocking injected draft editor scripts and removing any frontend dependency chain that triggers editor/script injection.

**Planned changes:**
- Add a temporary, early-loading in-site script that blocks Caffeine preview’s injected draft editor scripts from loading/executing, gated to only run on Caffeine draft preview hostnames/conditions, and loaded before the main application bundle.
- Remove/strip suspected editor-triggering dependencies/imports from the frontend bundle so Caffeine preview no longer decides to inject the draft editor subsystem.

**User-visible outcome:** Opening a Caffeine draft preview URL renders the React app normally (no blank white screen and no “disallowed origin” draft-editor error in the console), while normal (non-draft) deployments remain unaffected.
