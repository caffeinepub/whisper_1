# Specification

## Summary
**Goal:** Add a discoverable “Create Instance” entry point to the existing WhisperDavenport-IA frontend shell, with a UI-only placeholder explanation (no backend integration).

**Planned changes:**
- Add a visible button/link labeled exactly “Create Instance” in the primary app shell UI (e.g., near the existing “Connect” button and/or prominently on the main page).
- On click, open a lightweight dismissible placeholder UI (modal/dialog/sheet or inline panel) that explains instance creation is coming next step and briefly defines an “instance” as a city/county/state Whisper site.
- Ensure the new entry point and placeholder use the existing Tailwind + shadcn styling and do not navigate away or call any backend.

**User-visible outcome:** Users see a “Create Instance” button immediately on the main shell; clicking it opens a dismissible placeholder explaining what an instance is (city/county/state) and that creation will be implemented in the next step.
