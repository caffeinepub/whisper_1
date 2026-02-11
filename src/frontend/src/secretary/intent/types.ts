/**
 * Intent and slot type definitions for the Secretary mini-flow engine.
 * Defines supported intents and slot value shapes.
 */

import type { USState, USCounty, USPlace, USHierarchyLevel } from '@/backend';

/**
 * Supported intents that the Secretary can recognize
 */
export type SecretaryIntent =
  | 'report_issue'
  | 'find_instance'
  | 'create_instance'
  | 'ask_category'
  | 'top_issues'
  | null;

/**
 * Slot names used across intents
 */
export type SecretarySlot =
  | 'state'
  | 'county'
  | 'place'
  | 'issue_description'
  | 'issue_category';

/**
 * Slot value types
 */
export interface SlotValues {
  state: USState | null;
  county: USCounty | null;
  place: USPlace | null;
  issue_description: string;
  issue_category: string;
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
}

/**
 * Intent context extension for SecretaryContext
 */
export interface IntentContext {
  activeIntent: SecretaryIntent;
  slots: SlotBag;
}
