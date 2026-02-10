# Specification

## Summary
**Goal:** Improve Create Instance Proposal geography validation, update homepage header styling, and adjust the homepage hero background image behavior.

**Planned changes:**
- Add a geography validation guard in the Create Instance Proposal flow to prevent submission/progression when required geography selections are missing (state always required; county required when county/place selection is in progress; place required when place selection is in progress), while still allowing a submit/proceed attempt to trigger validation feedback.
- Show simple inline English validation messaging for missing geography (e.g., “Please select a state/county/place.”) and visually highlight the missing geography field; clear the error when any geography selection changes.
- Update the fixed HomeHeader (top menu/logo bar) background to solid black while keeping the existing layout and ensuring readable contrast for the logo and Get Started button.
- Set the homepage hero background to use the exact provided image URL, keep existing preload + fallback behavior, and bottom-justify the background image within the hero section (e.g., `background-position: center bottom`).

**User-visible outcome:** Users are clearly guided to complete required geography selections before continuing, the homepage header displays with a black background and readable content, and the hero background image uses the provided URL aligned to the bottom while loading smoothly.
