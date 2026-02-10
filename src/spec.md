# Specification

## Summary
**Goal:** Improve the header membership/login experience and refine the Secretary lookup flow so outcomes require explicit user action, while updating navbar branding colors.

**Planned changes:**
- Update header/nav styling so the existing teal logo remains unchanged, while the “Whisper” wordmark and all nav menu labels render white by default and use teal on hover/focus/active (desktop + mobile).
- Change the header “Get Started” CTA so, when unauthenticated, it initiates Internet Identity login (with a loading/disabled state during login) and does not trigger scrolling or any instance/chat/Secretary flows.
- When authenticated, replace “Get Started” with a profile control (avatar with fallback + label) that opens a submenu with “Profile” (routes to `/profile`) and “Logout” (logs out and clears cached queries), including equivalent access on mobile.
- Refine the Secretary lookup/discovery flow to stop any timeout-based auto-navigation; after state + county/city selection, show an explicit result message and present next-action buttons (view existing instance when found, or create an instance proposal when not found) while keeping the widget open until the user acts or closes it.

**User-visible outcome:** The navbar uses the updated white/teal behavior, “Get Started” logs visitors in via Internet Identity, logged-in users access Profile/Logout from a profile menu, and the Secretary lookup clearly presents results with explicit buttons rather than auto-navigating.
