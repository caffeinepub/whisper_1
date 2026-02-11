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

  // Report issue patterns
  if (
    normalized.includes('report') ||
    normalized.includes('issue') ||
    normalized.includes('problem') ||
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
    normalized.includes('my city') ||
    normalized.includes('my town') ||
    normalized.includes('location')
  ) {
    return 'find_instance';
  }

  // Create instance patterns
  if (
    normalized.includes('create') ||
    normalized.includes('new instance') ||
    normalized.includes('start instance') ||
    normalized.includes('propose')
  ) {
    return 'create_instance';
  }

  // Ask category patterns
  if (
    normalized.includes('category') ||
    normalized.includes('categories') ||
    normalized.includes('what can i report') ||
    normalized.includes('types of issues')
  ) {
    return 'ask_category';
  }

  // No match
  return null;
}

/**
 * Check if text looks like an intent trigger
 */
export function looksLikeIntentTrigger(text: string): boolean {
  return classifyIntent(text) !== null;
}
