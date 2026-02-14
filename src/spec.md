# Specification

## Summary
**Goal:** Restyle the Whisper Profile page to a solid, grounded, trustworthy civic aesthetic (visual-only), preserving all existing structure and functionality.

**Planned changes:**
- Update Profile page styling (Tailwind className changes + visual wrappers using existing UI components) to use a deep navy/slate base with teal/cyan accents and warm gold highlights; add stronger elevation, subtle dark borders, and light glassmorphism.
- Enhance the WSP Token Balance section to make the balance value larger/bolder with teal→cyan gradient emphasis; add a purely visual flourish (e.g., Sparkles and/or decorative ring) only when balance > 0 while keeping loading/zero-balance behavior unchanged.
- Enhance the Contribution Points section with distinct accent treatments per category, improved label/value hierarchy, and motivational subtext; add a subtle visual cue (Sparkles and/or “Earn more” styled text) for categories with 0 points without changing data/structure.
- Restyle Staking and Governance sections to match the new palette and make CTAs more prominent (larger buttons, gradient backgrounds, hover scale effects where available); use Lucide-react icons with accent colors; keep all dialogs/validation/behavior unchanged.
- Apply mobile-first spacing/typography improvements (stacking, padding, touch-friendly button sizing, consistent heading hierarchy, accessible contrast, and accent-colored focus rings) across the Profile page.

**User-visible outcome:** The Profile page looks more civic, grounded, and readable (especially on mobile), with more prominent balance/points and clearer, more compelling staking and governance CTAs—while behaving exactly the same as before.
