/**
 * Intent and slot type definitions for the Secretary mini-flow engine.
 * Defines supported intents and slot value shapes.
 * Extended with task management intents (create_task, find_tasks, update_task).
 */

import type { USState, USCounty, USPlace, USHierarchyLevel, TaskStatus } from '@/backend';

/**
 * Supported intents that the Secretary can recognize
 */
export type SecretaryIntent =
  | 'report_issue'
  | 'find_instance'
  | 'create_instance'
  | 'ask_category'
  | 'top_issues'
  | 'create_task'
  | 'find_tasks'
  | 'update_task'
  | null;

/**
 * Slot names used across intents
 */
export type SecretarySlot =
  | 'state'
  | 'county'
  | 'place'
  | 'issue_description'
  | 'issue_category'
  | 'task_title'
  | 'task_description'
  | 'task_category'
  | 'task_location_id'
  | 'task_id'
  | 'task_status';

/**
 * Slot value types
 */
export interface SlotValues {
  state: USState | null;
  county: USCounty | null;
  place: USPlace | null;
  issue_description: string;
  issue_category: string;
  task_title: string;
  task_description: string;
  task_category: string;
  task_location_id: string;
  task_id: string;
  task_status: TaskStatus | null;
}

/**
 * Slot bag structure tracking filled/unfilled values per intent
 */
export interface SlotBag {
  state: USState | null;
  county: USCounty | null;
  place: USPlace | null;
  issue_description: string;
  issue_category: string;
  task_title: string;
  task_description: string;
  task_category: string;
  task_location_id: string;
  task_id: string;
  task_status: TaskStatus | null;
}

/**
 * Intent context extension for SecretaryContext
 */
export interface IntentContext {
  activeIntent: SecretaryIntent;
  slots: SlotBag;
}
