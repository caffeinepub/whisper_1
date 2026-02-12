# Specification

## Summary
**Goal:** Extend the Secretary chat assistant to support task management via new intents for creating, finding, and updating tasks.

**Planned changes:**
- Add new `SecretaryIntent` values: `create_task`, `find_tasks`, and `update_task`.
- Add task-related slot definitions (title, description, category, location identifier, task identifier) and ensure slot bag creation, fill checks, and clearing logic work for these slots.
- Update the rule-based intent classifier to recognize common task-related user phrases and map them to the new intents without breaking existing intent behavior.
- Register the new intents in the intent flow registry, including required/optional slots, slot fill order, and `onComplete` hooks for create/list/update task operations (or navigation to an appropriate task UI route if needed).
- Add English slot-filling prompts for the new task slots so the Secretary can request missing information during the intent flows.
- Wire task intents into the Secretary runtime so chat input triggers classification, slot-filling, and then execution via existing task backend methods (createTask, listTasksByLocation, getTask/updateTask), returning short English confirmations/results in chat.

**User-visible outcome:** Users can type messages like “create a task”, “show my tasks”, or “mark task done”, and the Secretary will ask for any missing details, then create tasks, list tasks for a location, or update a task and confirm the result in the chat.
