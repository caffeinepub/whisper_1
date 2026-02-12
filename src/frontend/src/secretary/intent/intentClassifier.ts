/**
 * Rule-based client-side intent classifier.
 * Maps user free text to supported intents using keyword/pattern matching.
 * Extended with task management intent recognition.
 */

import type { SecretaryIntent } from './types';

/**
 * Classify user input text to an intent
 * Returns null if no match found
 */
export function classifyIntent(text: string): SecretaryIntent | null {
  const normalized = text.toLowerCase().trim();

  // Task intent patterns (check early for specificity)
  // Create task patterns
  if (
    (normalized.includes('create') || normalized.includes('add') || normalized.includes('new') || normalized.includes('make')) &&
    normalized.includes('task')
  ) {
    return 'create_task';
  }

  // Find/list tasks patterns
  if (
    (normalized.includes('show') || normalized.includes('list') || normalized.includes('find') || normalized.includes('view') || normalized.includes('see')) &&
    (normalized.includes('task') || normalized.includes('tasks'))
  ) {
    return 'find_tasks';
  }

  // Update task patterns
  if (
    (normalized.includes('update') || normalized.includes('mark') || normalized.includes('complete') || normalized.includes('done') || normalized.includes('change') || normalized.includes('close')) &&
    normalized.includes('task')
  ) {
    return 'update_task';
  }

  // Top issues patterns (check before generic issue patterns)
  if (
    (normalized.includes('top') || normalized.includes('common') || normalized.includes('most')) &&
    (normalized.includes('issue') || normalized.includes('problem') || normalized.includes('complaint'))
  ) {
    return 'top_issues';
  }

  if (
    normalized.includes('what') &&
    (normalized.includes('issue') || normalized.includes('problem')) &&
    (normalized.includes('in') || normalized.includes('for'))
  ) {
    return 'top_issues';
  }

  // Report issue patterns - expanded
  if (
    normalized.includes('report') ||
    normalized.includes('complaint') ||
    normalized.includes('complain') ||
    normalized.includes('broken') ||
    normalized.includes('fix') ||
    normalized.includes('problem') ||
    (normalized.includes('issue') && !normalized.includes('top'))
  ) {
    return 'report_issue';
  }

  // Find instance patterns
  if (
    normalized.includes('find') ||
    normalized.includes('search') ||
    normalized.includes('discover') ||
    normalized.includes('explore') ||
    (normalized.includes('what') && normalized.includes('happening'))
  ) {
    return 'find_instance';
  }

  // Create instance patterns - expanded
  if (
    normalized.includes('create') ||
    (normalized.includes('new') && normalized.includes('instance')) ||
    (normalized.includes('start') && normalized.includes('whisper')) ||
    (normalized.includes('propose') && normalized.includes('instance'))
  ) {
    return 'create_instance';
  }

  // Ask category patterns
  if (
    normalized.includes('categor') ||
    (normalized.includes('type') && normalized.includes('issue'))
  ) {
    return 'ask_category';
  }

  return null;
}
