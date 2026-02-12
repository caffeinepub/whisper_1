# Specification

## Summary
**Goal:** Add automatic intent slot-filling to the Secretary so it can extract details from a single user message, prompt only for missing required info, and complete flows consistently.

**Planned changes:**
- Enable slot-filling mode to pre-fill slots from a single user message (at minimum: geography slots and an initial issue description for the report-issue intent), then prompt only for missing required slots using existing English prompt copy.
- Add complaint category suggestions during report-issue slot-filling when issue_category is the next missing slot; allow selecting a suggestion to fill the slot, and fall back to typed input if no suggestions are available.
- Fix location typeahead selection so it correctly fills whichever geography slot is currently active (state/county/place) and advances slot-filling reliably.
- Ensure consistent, user-visible completion behavior: after all required slots are filled, run the existing intent completion navigation, then reset back to the main menu with an English confirmation message.

**User-visible outcome:** Users can describe an issue in one message (e.g., “Potholes in Omaha, Nebraska near 72nd street”), see the Secretary auto-fill what it can, answer only the remaining questions (including choosing from suggested categories when applicable), and then be taken to the existing completion destination and returned to the main menu with a clear English confirmation.
