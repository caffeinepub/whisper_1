# Homepage Redesign Notes

## Overview
This document tracks the visual and UX improvements made to the Whisper homepage in Draft Version 19 and subsequent updates.

---

## Hero Section

### Hero Image
- **Current Asset**: `/frontend/public/assets/generated/whisper-hero-provided.dim_1600x900.png`
- **Description**: User-provided hero image for community collaboration theme
- **Implementation**: Full-width background image with `cover` sizing and `center bottom` positioning
- **Reference**: Static asset loaded directly from `/assets/generated/whisper-hero-provided.dim_1600x900.png`

### Hero Overlay
- **Color**: Dark blue `oklch(0.20 0.08 230)`
- **Opacity**: Exactly 30% (0.3)
- **Purpose**: Provides contrast for white hero text while maintaining image visibility
- **Readability**: Hero headline and description maintain >4.5:1 contrast ratio across all viewport sizes

### Hero Content
- **Headline**: "Reclaiming Government of the People, by the People"
- **Typography**: 
  - Desktop: `text-7xl` (4.5rem)
  - Mobile: `text-5xl` (3rem)
  - Weight: `font-extrabold`
  - Color: `text-white` with text shadow for enhanced readability
- **Description**: Multi-line value proposition with `text-white/95` for subtle transparency
- **CTAs**: 
  - Primary: "Explore Whisper" (teal accent button with white text)
  - Secondary: "Talk to Secretary" (outlined teal button with backdrop blur)

---

## High-Contrast Fixes

### Buttons
**Before**: White text on white/light backgrounds (invisible or low contrast)
**After**: 
- All primary CTAs use `bg-accent` (teal) with `text-white` and `border-accent/20`
- Hover states: `hover:bg-accent-hover` (darker teal) with `hover:shadow-glow-lg`
- Outline buttons: `border-white/40 bg-white/10` with `hover:bg-white/20` for glass effect
- Quick action buttons: Consistent teal background with white text throughout

### Secretary Chat Bubbles
**Before**: Dark text on dark backgrounds (unreadable)
**After**:
- User bubbles: `bg-accent text-white` (teal background, white text)
- Assistant bubbles: `bg-secretary-bubble text-white` (lighter dark surface with white text)
- Widget title: `text-white` (bright white for header)
- Quick action labels: `text-white/70` for muted secondary text
- All interactive elements maintain WCAG AA contrast (≥4.5:1)

### Secretary Widget Background
**Current Implementation**: `bg-black/50 backdrop-blur-md`
- **Background**: Black at 50% opacity to preserve text legibility over light page backgrounds
- **Backdrop Blur**: Medium blur (`backdrop-blur-md`) for depth and visual separation
- **Text Colors**: All text rendered in white or white with transparency for consistent readability
- **Input Field**: `bg-white/5 text-white placeholder:text-white/50` for subtle contrast
- **Buttons**: White text on semi-transparent backgrounds with hover states that transition to accent color

---

## Typography & Spacing

### Font Families
- **Body**: Inter (system fallback: sans-serif)
- **Monospace**: JetBrains Mono (for hierarchy preview)

### Text Sizes
- Hero headline: `text-5xl md:text-7xl`
- Hero description: `text-xl md:text-2xl`
- Section headings: `text-2xl` to `text-3xl`
- Card titles: `text-lg` to `text-2xl` (context-dependent)
- Body text: `text-sm` to `text-base`
- Minimum body text: 16px (WCAG AA compliance)

### Spacing
- Hero section: `py-20 md:py-32`
- Container padding: `px-4`
- Card gaps: `gap-4` to `gap-8` (responsive)
- Content sections: `space-y-6` to `space-y-12`

---

## Shadows & Effects

### Shadow Utilities
- `shadow-glow`: Subtle teal glow for accent elements
- `shadow-glow-lg`: Larger glow for hover states
- `shadow-md`: Standard elevation for cards
- Text shadows: Enhanced shadows for hero text over images

### Hover Effects
- `hover-lift`: Subtle translateY(-2px) with transition
- `hover:shadow-glow-lg`: Expanded glow on hover
- `transition-all`: Smooth transitions for all interactive elements

### Animations
- `animate-fade-in-up`: Hero content entrance animation
- `animation-delay`: Staggered delays (150ms, 300ms) for sequential reveals
- `motion-reduce:opacity-100`: Respects user's reduced motion preference

---

## Color Palette

### Primary Colors
- **Accent (Teal)**: `oklch(0.65 0.15 200)` - Primary CTA color
- **Accent Hover**: `oklch(0.55 0.15 200)` - Darker teal for hover states
- **Success (Green)**: `oklch(0.65 0.15 150)` - Positive actions
- **Warning (Amber)**: `oklch(0.75 0.15 85)` - Attention states
- **Destructive (Red)**: `oklch(0.60 0.20 25)` - Destructive actions

### Neutral Colors
- **Background**: `oklch(0.15 0.02 240)` - Dark navy base
- **Card**: `oklch(0.20 0.02 240)` - Slightly lighter navy for cards
- **Secretary Bubble**: `oklch(0.30 0.02 240)` - Lighter surface for assistant messages
- **Border**: `oklch(0.30 0.02 240)` with opacity variants
- **Foreground**: `oklch(0.98 0 0)` - Near-white text

### Semantic Usage
- Primary CTAs: Teal accent with white text
- Secondary CTAs: Outlined with glass effect
- Success indicators: Green badges and icons
- Warning indicators: Amber badges
- Hierarchy preview: Muted foreground with accent highlights

---

## Accessibility

### WCAG AA Compliance
- All text meets ≥4.5:1 contrast ratio
- Interactive elements have clear focus states
- Reduced motion support via `motion-reduce:` utilities
- Semantic HTML structure (header, main, section, footer)
- ARIA labels for icon-only buttons

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus visible on all focusable elements
- Logical tab order throughout the page

---

## Responsive Design

### Breakpoints
- Mobile: Default (< 768px)
- Tablet: `md:` (≥ 768px)
- Desktop: `lg:` (≥ 1024px)

### Layout Adjustments
- Hero: Single column on mobile, centered content on all sizes
- Main grid: Stacked on mobile, 3-column on desktop (`md:grid-cols-3`)
- Navigation: Hidden on mobile, visible on tablet+ (`hidden md:flex`)
- Cards: Full-width on mobile, grid on desktop

---

## Component Styling

### Cards
- Background: `bg-card/80 backdrop-blur-sm` for glass effect
- Borders: `border-accent/50` for primary cards, `border-border/50` for secondary
- Hover: `hover-lift` class for subtle elevation change
- Shadows: `shadow-glow` for accent cards

### Buttons
- Border radius: `rounded-full` for hero CTAs, `rounded-xl` for standard buttons
- Padding: `px-10 py-7` for large buttons, `px-4` for standard
- Icons: `h-4 w-4` to `h-6 w-6` (context-dependent)
- Disabled state: `disabled:opacity-50`

### Badges
- Variants: `outline` with semantic color backgrounds
- Success: `bg-success/10 text-success border-success/30`
- Warning: `bg-warning/10 text-warning border-warning/30`

---

## Footer

### Structure
- Dark navy background (`bg-[oklch(0.15_0.05_230)]`)
- Top border: `border-t border-white/10`
- Responsive flex layout: Column on mobile, row on desktop

### Content
- Copyright: Dynamic year via `new Date().getFullYear()`
- Attribution: "Built with ❤ using caffeine.ai"
- UTM tracking: `utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`
- App identifier: Uses `window.location.hostname` for tracking

---

## Demo Preview
[Placeholder for demo URL once deployed]

---

## Change Log

### Draft Version 19
- Initial hero image integration with community collaboration theme
- High-contrast button fixes (white-on-teal throughout)
- Secretary bubble contrast improvements (white text on lighter dark surfaces)
- Typography and spacing polish
- Hover effects and animations
- WCAG AA compliance verification

### Draft Version 20
- **Hero Image**: Replaced with photorealistic real-life community image (`whisper-hero-community-real.dim_1600x900.png`)
- **Hero Overlay**: Increased opacity by ~20% for improved text readability (from-slate-900/95 → from-slate-900/100, via-slate-800/90 → via-slate-800/95, to-teal-900/85 → to-teal-900/90)
- **Secretary Widget**: Changed container background to black at 50% opacity (`bg-black/50`) with medium backdrop blur for consistent text legibility over light page backgrounds
- **Secretary Widget Text**: Updated all text colors to white or white with transparency for improved contrast against the new black background
- **Secretary Widget Buttons**: Updated quick action buttons and input field styling to work with the new semi-transparent black background

### Draft Version 34
- **Hero Image**: Replaced with user-provided static asset (`whisper-hero-provided.dim_1600x900.png`)
- **Hero Overlay**: Changed to dark blue `oklch(0.20 0.08 230)` at exactly 30% opacity (0.3) for improved image visibility while maintaining text contrast
- **Hero Implementation**: Confirmed static asset loading (no backend calls) with `center bottom` positioning
