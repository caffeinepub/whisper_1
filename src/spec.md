# Specification

## Summary
**Goal:** Pass Secretary smoke-test steps 5 and 6 by fixing geography suggestions after state selection and ensuring the Secretary flow engine matches the documented checklist, without console errors.

**Planned changes:**
- Update the Secretary discovery flow so that after selecting a state, county/city suggestions appear immediately and filter correctly based on the chosen state and user input.
- Align Secretary flow engine behavior with the step-6 checklist and documented scenarios: initial menu rendering, discovery path, report-issue paths (with/without top issues), “Something else” custom category path, back-to-menu reset behavior, keyword navigation routing/close behavior, and unknown-input recovery messaging/actions.
- Eliminate browser console errors and React hooks warnings occurring during these flows.

**User-visible outcome:** In the Secretary widget, users can complete discovery (state → location → result) with correctly filtered location suggestions, navigate menu/report-issue/custom-category paths as expected, recover from unknown inputs, and return to the menu with state reset—without console errors.
