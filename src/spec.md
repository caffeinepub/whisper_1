# Specification

## Summary
**Goal:** Improve onboarding navigation into the Profile flow and unify back navigation + layout styling across Profile, Feed, Tasks, and Geography pages.

**Planned changes:**
- Update the Home page “Get Started” CTA to navigate to `/profile` using base-path-safe SPA navigation (joinBasePath + popstate updates), prompting Internet Identity authentication when needed.
- Add a shared, consistently styled Back control pattern across Feed, Geography, Tasks list, Task detail, Task create, and Profile pages with base-path-safe navigation behavior.
- Normalize layout styling across Feed, Tasks, and Geography (header approach, spacing/top offset, typography, container widths, and card styling), including removing Geography’s bespoke fixed black header styling.

**User-visible outcome:** Clicking “Get Started” takes users into the Profile onboarding flow (with login prompt if required). Feed, Tasks, Geography, and Profile pages look and feel consistent, and each provides a clear, consistent Back control that returns users to the appropriate prior/home destination.
