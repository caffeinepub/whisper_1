/**
 * Task intent execution helpers.
 * Implements task intent execution that calls the existing actor task capabilities
 * and returns concise, user-facing English messages.
 */

import type { backendInterface } from '@/backend';
import type { SlotBag } from './types';
import { executeCreateTask, executeFindTasks, executeUpdateTask } from './taskIntentActions';

/**
 * Execute a task intent and return a user-facing message
 */
export async function executeTaskIntent(
  intent: 'create_task' | 'find_tasks' | 'update_task',
  slots: SlotBag,
  actor: backendInterface | null
): Promise<string> {
  switch (intent) {
    case 'create_task':
      return executeCreateTask(slots, actor);
    case 'find_tasks':
      return executeFindTasks(slots, actor);
    case 'update_task':
      return executeUpdateTask(slots, actor);
    default:
      return 'I\'m not sure how to handle that task operation.';
  }
}
