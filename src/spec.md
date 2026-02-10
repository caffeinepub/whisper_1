# Specification

## Summary
**Goal:** Apply a cohesive teal theme across the Whisper UI via reliable design tokens, and update the hero background to a new bottom-justified image.

**Planned changes:**
- Standardize global design tokens/CSS variables so Tailwind utilities like `text-secondary`, `bg-secondary`, `border-secondary`, `ring-secondary`, and `bg-accent` consistently resolve to the intended teal values in light and dark mode (removing any conflicting/duplicate variable definitions).
- Update styling (Tailwind classes and/or token usage) so teal accents apply consistently to the header brand area (icon + “Whisper”), non-semantic Lucide icons, and button variants (including secondary/outline) including hover/focus ring states, without changing behavior or adding components.
- Replace the hero background with the provided image, store it as a static asset under `frontend/public/assets/generated/`, and set the hero background positioning to bottom-justified while preserving overlay and text readability.

**User-visible outcome:** The app displays consistent teal accents across key UI elements (logo, icons, buttons) in both light and dark mode, and the hero section shows the new community-collaboration image anchored to the bottom with readable text.
