# Specification

## Summary
**Goal:** Update the Secretary guided report-issue flow to collect and display location using a hierarchical selector (state → county → place/city) and reliably persist a canonical location reference for the confirmation summary.

**Planned changes:**
- Replace (or supplement) the current single typeahead location step in the Secretary guided report-issue flow with a hierarchical state → county → place selection UI, with dependent controls disabled until prerequisites are chosen.
- Store the selected canonical `locationId` and a human-readable location label in the guided report draft so the confirmation summary displays the chosen location reliably.
- Add/compose Secretary-specific UI component(s) for the hierarchical selector using existing geography selector components/hooks where possible, matching existing shadcn + Tailwind styling and keyboard/accessibility behavior.
- Ensure the Secretary widget remains usable within its fixed panel size and that other Secretary flows (menu, discovery, legacy report issue flow) do not regress.

**User-visible outcome:** In the guided report-issue flow, users can pick a location via state → county → place (without typing a location string), proceed to the next step, and see the selected location label correctly shown in the confirmation summary.
