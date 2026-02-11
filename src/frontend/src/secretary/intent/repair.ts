/**
 * Lightweight repair detection/parsing for user messages.
 * Detects correction cues and provides utilities to clear dependent slots.
 */

import type { SecretarySlot } from './types';

/**
 * Check if user message looks like a repair/correction
 */
export function looksLikeRepair(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  
  const repairCues = [
    'actually',
    'no,',
    'not',
    'change',
    'instead',
    'meant',
    'sorry',
    'oops',
    'wait',
    'correction',
    'fix',
    'update',
  ];
  
  return repairCues.some(cue => normalized.startsWith(cue) || normalized.includes(` ${cue} `));
}

/**
 * Parse which slot the user is trying to repair
 * Uses heuristics based on context and content
 */
export function parseRepairSlot(text: string): SecretarySlot | null {
  const normalized = text.toLowerCase().trim();
  
  // Explicit slot mentions
  if (normalized.includes('state')) return 'state';
  if (normalized.includes('county')) return 'county';
  if (normalized.includes('city') || normalized.includes('town') || normalized.includes('place')) return 'place';
  if (normalized.includes('description')) return 'issue_description';
  if (normalized.includes('category')) return 'issue_category';
  
  // Heuristic: if it looks like a state name (short, 2 letters or full name)
  // This is a simple heuristic - could be enhanced with geography data
  const words = normalized.split(/\s+/);
  if (words.some(w => w.length === 2 && /^[a-z]{2}$/.test(w))) {
    return 'state';
  }
  
  // Default to most recent slot (would need context to determine)
  return null;
}

/**
 * Apply repair to context by clearing the slot and dependents
 */
export function applyRepair(
  slots: any,
  slotToRepair: SecretarySlot,
  clearDependentsFn: (slot: SecretarySlot) => void
): void {
  clearDependentsFn(slotToRepair);
}
