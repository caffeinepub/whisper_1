# Specification

## Summary
**Goal:** Remove remaining editor-related frontend dependencies and permanently update the homepage hero headline/subtext strings (without changing design or functionality).

**Planned changes:**
- Remove any remaining editor-related frontend packages, imports, references, and runtime paths; verify a clean frontend rebuild and app load with no editor-related errors.
- In `frontend/src/App.tsx` (home route hero), replace only the displayed hero headline and subtext with the exact provided strings and add the required permanent two-line comment immediately above them.

**User-visible outcome:** The app builds and loads without any editor-related code, and the homepage hero section shows the new official mission headline and subtext exactly as provided, with no other UI or behavior changes.
