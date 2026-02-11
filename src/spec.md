# Specification

## Summary
**Goal:** Add a lightweight intent/slot mini-flow engine to the Secretary assistant, integrating existing geography typeaheads and issue-category suggestions, with completion and repair behavior.

**Planned changes:**
- Define core Secretary intents (`report_issue`, `find_instance`, `create_instance`, `ask_category`) and track `activeIntent` plus per-intent slot state (filled/unfilled) for `state`, `county`, `city/place`, `issue_category`, `issue_description`, including the ability to reset slots independently.
- Add a client-side, rule-based intent classifier (keyword/pattern matching) that maps free-text input to supported intents and safely falls back on unknown text.
- Implement slot-filling prompts per intent that ask for the next missing required slot step-by-step, without re-asking for already-filled slots, using existing text input and typeahead UI controls.
- Wire geography slot filling to existing geography data sources so state/county/place suggestions come from the current fetched lists and selecting an option fills the slot and advances the flow.
- Integrate issue-category suggestions after an issue description is provided, allowing selection from suggestions or custom entry, storing the result in `issue_category`; add backend endpoints in `backend/main.mo` with stable data arrays if needed per the existing suggestions spec doc.
- Add intent completion rules that trigger existing navigation/flows for `report_issue`, `create_instance`, and `find_instance` (matching current behavior such as closing the widget for menu-like actions).
- Add repair behavior during slot filling so changing a slot (e.g., state) resets only that slot and dependent slots (e.g., clears county/place) without wiping the whole conversation.
- Create a simple flow registry module mapping intents to required slots, prompt order, and completion action, designed to be extensible for future intents.
- Update the Secretary smoke test checklist to cover intent triggering, geography slot filling via typeahead, category selection/custom entry, and mid-flow slot changes, ensuring existing smoke tests still pass.

**User-visible outcome:** Users can type free-text requests (e.g., “report an issue”, “find instance”, “create instance”, “category”), be guided through filling required geography and issue/category details with typeahead suggestions, change earlier answers without restarting, and be routed into the existing app flows when the intent is complete.
