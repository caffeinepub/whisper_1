/**
 * Rule-based client-side intent classifier.
 * Maps user free text to supported intents using keyword/pattern matching.
 */

import type { SecretaryIntent } from './types';

/**
 * Classify user input text to an intent
 * Returns null if no match found
 */
export function classifyIntent(text: string): SecretaryIntent {
  const normalized = text.toLowerCase().trim();

  // Top issues patterns (new - check first for specificity)
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

  // Report issue patterns
  if (
    normalized.includes('report') ||
    normalized.includes('complaint') ||
    normalized.includes('broken') ||
    normalized.includes('fix')
  ) {
    return 'report_issue';
  }

  // Find instance patterns
  if (
    normalized.includes('find') ||
    normalized.includes('search') ||
    normalized.includes('discover') ||
    normalized.includes('explore') ||
    normalized.includes('what') && normalized.includes('happening')
  ) {
    return 'find_instance';
  }

  // Create instance patterns
  if (
    normalized.includes('create') ||
    normalized.includes('new') && normalized.includes('instance') ||
    normalized.includes('start') && normalized.includes('whisper')
  ) {
    return 'create_instance';
  }

  // Ask category patterns
  if (
    normalized.includes('categor') ||
    normalized.includes('type') && normalized.includes('issue')
  ) {
    return 'ask_category';
  }

  return null;
}
