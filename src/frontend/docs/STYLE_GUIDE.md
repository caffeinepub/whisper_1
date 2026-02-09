# Whisper Visual Style Guide

## Design Philosophy

Whisper is a civic accountability platform that empowers citizens to hold institutions accountable. The visual design must convey **trust, transparency, accessibility, and civic duty** while avoiding the generic "tech startup" aesthetic (purple gradients, safe blues, uniform rounded corners).

### Core Design Principles

1. **Civic Authority**: Inspired by government documents, courthouses, and civic institutions—clean, structured, authoritative without being intimidating.
2. **Accessibility First**: WCAG AA+ contrast ratios, readable typography, clear visual hierarchy.
3. **Transparency**: Open, uncluttered layouts that reflect the platform's commitment to transparency.
4. **Equality**: Consistent treatment of all users; no visual hierarchy based on status (except role badges).
5. **Distinctive**: Avoid generic SaaS aesthetics; use intentional design choices that reflect Whisper's mission.

## Color Palette

### Primary Colors

**Civic Slate** (Primary):
- Light mode: `oklch(0.35 0.02 240)` — Deep slate blue-gray, authoritative and trustworthy
- Dark mode: `oklch(0.85 0.02 240)` — Light slate for contrast
- Usage: Primary buttons, headers, key UI elements

**Civic Red** (Accent):
- Light mode: `oklch(0.55 0.18 25)` — Muted red-orange, urgency without alarm
- Dark mode: `oklch(0.65 0.18 25)` — Slightly brighter for visibility
- Usage: Issue status indicators, important actions, alerts

**Civic Green** (Success):
- Light mode: `oklch(0.55 0.15 145)` — Muted forest green, resolution and progress
- Dark mode: `oklch(0.65 0.15 145)` — Brighter for dark backgrounds
- Usage: Resolved issues, success states, positive feedback

### Neutral Colors

**Background**:
- Light mode: `oklch(0.98 0 0)` — Warm off-white, reduces eye strain
- Dark mode: `oklch(0.18 0 0)` — Deep charcoal, not pure black

**Foreground (Text)**:
- Light mode: `oklch(0.25 0 0)` — Near-black for readability
- Dark mode: `oklch(0.95 0 0)` — Near-white

**Muted (Secondary Text)**:
- Light mode: `oklch(0.55 0 0)` — Mid-gray for labels, metadata
- Dark mode: `oklch(0.65 0 0)` — Lighter gray for dark mode

**Border**:
- Light mode: `oklch(0.88 0 0)` — Subtle borders, not harsh
- Dark mode: `oklch(0.30 0 0)` — Visible but not distracting

### Semantic Colors

**Warning** (Escalation, Pending):
- Light mode: `oklch(0.65 0.15 75)` — Amber, attention without panic
- Dark mode: `oklch(0.70 0.15 75)`

**Destructive** (Delete, Critical):
- Light mode: `oklch(0.55 0.22 25)` — Strong red, clear danger signal
- Dark mode: `oklch(0.65 0.22 25)`

### Color Usage Guidelines

- **Never use raw hex colors** in components; always use CSS variables or Tailwind tokens.
- **Maintain AA+ contrast**: Test all color combinations for accessibility.
- **Limit palette**: Use 3-5 colors maximum per view to avoid visual noise.
- **Semantic consistency**: "Civic Red" always means urgency/action; "Civic Green" always means success/resolution.

## Typography

### Font Families

**Headings**: `'Inter', system-ui, sans-serif`
- Rationale: Clean, modern, excellent readability at all sizes
- Weights: 600 (semibold) for H1-H3, 500 (medium) for H4-H6

**Body**: `'Inter', system-ui, sans-serif`
- Rationale: Same family for consistency, but lighter weights
- Weights: 400 (regular) for body text, 500 (medium) for emphasis

**Monospace** (Code, IDs): `'JetBrains Mono', 'Courier New', monospace`
- Rationale: Distinctive, readable for technical content (canister IDs, principals)
- Weight: 400 (regular)

### Type Scale

- **H1**: 2.5rem (40px), line-height 1.2, weight 600, letter-spacing -0.02em
- **H2**: 2rem (32px), line-height 1.25, weight 600, letter-spacing -0.01em
- **H3**: 1.5rem (24px), line-height 1.3, weight 600
- **H4**: 1.25rem (20px), line-height 1.4, weight 500
- **H5**: 1.125rem (18px), line-height 1.4, weight 500
- **H6**: 1rem (16px), line-height 1.5, weight 500
- **Body**: 1rem (16px), line-height 1.6, weight 400
- **Small**: 0.875rem (14px), line-height 1.5, weight 400
- **Tiny**: 0.75rem (12px), line-height 1.4, weight 400

### Typography Guidelines

- **Hierarchy**: Use size and weight to establish clear hierarchy; avoid relying on color alone.
- **Line Length**: Max 70 characters per line for body text (optimal readability).
- **Spacing**: Generous line-height (1.6 for body) for readability.
- **Tracking**: Negative letter-spacing for large headings (-0.02em for H1) to tighten visual weight.

## Layout & Spacing

### Spacing Scale

Use a consistent 4px base unit:
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

### Layout Principles

1. **Generous Whitespace**: Avoid cramped layouts; use `lg` (24px) or `xl` (32px) padding for major sections.
2. **Consistent Rhythm**: Use spacing scale consistently (e.g., all card padding is `lg`, all section gaps are `xl`).
3. **Responsive**: Mobile-first design; stack elements vertically on small screens, use grid/flex on larger screens.
4. **Max Width**: Content containers max 1200px wide for readability; full-width for dashboards/tables.

## Border Radius

**Intentional Variation** (avoid uniform rounding):
- **Sharp** (0px): Tables, data grids, technical content (conveys precision)
- **Subtle** (4px): Buttons, inputs, small cards (modern but restrained)
- **Moderate** (12px): Large cards, modals, panels (friendly but professional)
- **Full** (9999px): Badges, avatars, pills (distinctive elements)

**Usage**:
- Issue cards: 12px (moderate)
- Buttons: 4px (subtle)
- Status badges: full (pill shape)
- Data tables: 0px (sharp)

## Shadows & Elevation

**Subtle Elevation** (avoid heavy shadows):
- **xs**: `0 1px 2px 0 rgba(0,0,0,0.05)` — Subtle lift for cards
- **sm**: `0 2px 4px 0 rgba(0,0,0,0.08)` — Hover states
- **md**: `0 4px 8px 0 rgba(0,0,0,0.12)` — Modals, popovers
- **lg**: `0 8px 16px 0 rgba(0,0,0,0.16)` — Drawers, sheets (rare)

**Usage**:
- Default cards: xs shadow
- Hover states: sm shadow
- Modals/dialogs: md shadow
- Avoid lg shadow unless absolutely necessary

## Component Styling

### Buttons

**Primary** (Civic Slate):
- Background: `oklch(0.35 0.02 240)`
- Text: `oklch(0.98 0 0)`
- Hover: Lighten background by 10%
- Border radius: 4px
- Padding: 0.5rem 1rem (sm/md)

**Secondary** (Outline):
- Background: transparent
- Border: 1px solid `oklch(0.35 0.02 240)`
- Text: `oklch(0.35 0.02 240)`
- Hover: Background `oklch(0.95 0 0)`
- Border radius: 4px

**Destructive** (Civic Red):
- Background: `oklch(0.55 0.22 25)`
- Text: white
- Hover: Darken by 10%
- Border radius: 4px

### Cards

- Background: `oklch(1 0 0)` (light) / `oklch(0.22 0 0)` (dark)
- Border: 1px solid `oklch(0.88 0 0)` (light) / `oklch(0.30 0 0)` (dark)
- Border radius: 12px
- Padding: 1.5rem (lg)
- Shadow: xs

### Forms

**Inputs**:
- Background: `oklch(1 0 0)` (light) / `oklch(0.20 0 0)` (dark)
- Border: 1px solid `oklch(0.88 0 0)` (light) / `oklch(0.30 0 0)` (dark)
- Border radius: 4px
- Padding: 0.5rem 0.75rem
- Focus: Border `oklch(0.35 0.02 240)`, ring 2px `oklch(0.35 0.02 240 / 0.2)`

**Labels**:
- Font size: 0.875rem (small)
- Weight: 500 (medium)
- Color: `oklch(0.35 0 0)` (light) / `oklch(0.85 0 0)` (dark)
- Margin bottom: 0.5rem (sm)

### Status Badges

- **Open**: Background `oklch(0.55 0.18 25 / 0.1)`, text `oklch(0.45 0.18 25)`, border radius full
- **In Progress**: Background `oklch(0.65 0.15 75 / 0.1)`, text `oklch(0.55 0.15 75)`, border radius full
- **Resolved**: Background `oklch(0.55 0.15 145 / 0.1)`, text `oklch(0.45 0.15 145)`, border radius full
- **Escalated**: Background `oklch(0.65 0.15 75 / 0.1)`, text `oklch(0.55 0.15 75)`, border radius full

## Accessibility

### Contrast Requirements

- **Normal text** (< 18px): Minimum 4.5:1 contrast ratio
- **Large text** (≥ 18px or ≥ 14px bold): Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio for borders, icons

### Focus States

- **Visible focus ring**: 2px solid `oklch(0.35 0.02 240)` with 2px offset
- **Keyboard navigation**: All interactive elements must have clear focus states
- **Skip links**: Provide "Skip to main content" link for screen readers

### Screen Reader Support

- **Semantic HTML**: Use `<header>`, `<main>`, `<nav>`, `<article>`, `<section>` appropriately
- **ARIA labels**: Add `aria-label` to icon-only buttons
- **Alt text**: All images must have descriptive alt text

## Motion & Animation

**Subtle, Purposeful Motion**:
- **Duration**: 150-300ms for most transitions (avoid slow animations)
- **Easing**: `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for state changes
- **Use cases**: Hover states, modal open/close, accordion expand/collapse
- **Avoid**: Gratuitous animations, parallax effects, auto-playing animations

**Examples**:
- Button hover: `transition: background-color 150ms ease-out`
- Modal open: `transition: opacity 200ms ease-out, transform 200ms ease-out`
- Accordion: `transition: height 250ms ease-in-out`

## Responsive Breakpoints

- **Mobile**: < 640px (stack vertically, full-width cards)
- **Tablet**: 640px - 1024px (2-column grids, collapsible sidebar)
- **Desktop**: > 1024px (3-column grids, persistent sidebar)

## Icon Usage

- **Primary icon library**: Lucide React (consistent style, open source)
- **Brand logos**: React Icons (`react-icons/si`) for social media, external services
- **Size**: 16px (small), 20px (default), 24px (large)
- **Color**: Inherit from parent text color for consistency

## Summary

Whisper's visual design is **civic, authoritative, and accessible**. It avoids generic SaaS aesthetics through intentional color choices (slate/red/green, not blue/purple), varied border radii (sharp for data, rounded for UI), and restrained shadows. Typography is clean and readable (Inter), with generous spacing and clear hierarchy. All design decisions reflect the platform's mission: transparency, equality, and accountability.
