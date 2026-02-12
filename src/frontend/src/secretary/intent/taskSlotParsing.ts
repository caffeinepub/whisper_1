/**
 * Task slot parsing helpers.
 * Small, deterministic parsing helpers for filling task slots from free text.
 */

import type { TaskStatus } from '@/backend';
import type { USState, USCounty, USPlace } from '@/backend';

/**
 * Extract a numeric task ID from text
 */
export function parseTaskId(text: string): string | null {
  const normalized = text.toLowerCase().trim();
  
  // Look for patterns like "task 123", "task #123", "id 123", "#123"
  const patterns = [
    /task\s*#?(\d+)/i,
    /id\s*#?(\d+)/i,
    /#(\d+)/,
    /^(\d+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Parse task status from text
 */
export function parseTaskStatus(text: string): TaskStatus | null {
  const normalized = text.toLowerCase().trim();

  if (normalized.includes('open') || normalized.includes('new')) {
    return 'open' as TaskStatus;
  }
  if (normalized.includes('progress') || normalized.includes('working') || normalized.includes('started')) {
    return 'in_progress' as TaskStatus;
  }
  if (normalized.includes('block') || normalized.includes('stuck') || normalized.includes('waiting')) {
    return 'blocked' as TaskStatus;
  }
  if (
    normalized.includes('done') ||
    normalized.includes('complete') ||
    normalized.includes('resolved') ||
    normalized.includes('finished') ||
    normalized.includes('closed')
  ) {
    return 'resolved' as TaskStatus;
  }

  return null;
}

/**
 * Derive location identifier from geography slots
 */
export function deriveLocationId(
  state: USState | null,
  county: USCounty | null,
  place: USPlace | null
): string | null {
  // Prefer most specific geography available
  if (place) {
    return place.hierarchicalId;
  }
  if (county) {
    return county.hierarchicalId;
  }
  if (state) {
    return state.hierarchicalId;
  }
  return null;
}

/**
 * Extract location identifier from free text (simple heuristic)
 */
export function parseLocationId(text: string): string | null {
  const normalized = text.toLowerCase().trim();
  
  // Look for patterns like "location abc123", "loc abc123", or just a hierarchical ID
  const patterns = [
    /location\s+([a-z0-9_-]+)/i,
    /loc\s+([a-z0-9_-]+)/i,
    /^([a-z]{2}_[a-z0-9_-]+)$/i, // Hierarchical ID pattern like "CA_06_12345"
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
