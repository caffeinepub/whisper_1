/**
 * Lightweight repair detection/parsing for user messages.
 * Detects intent to update specific slot(s) and provides utilities to clear dependent slots.
 */

import type { SecretarySlot } from './types';
import { clearDependentSlots } from './slotState';

/**
 * Repair cue patterns
 */
const REPAIR_CUES = [
  'actually',
  'sorry',
  'i meant',
  'no wait',
  'change',
  'instead',
  'rather',
  'correction',
];

/**
 * Detect if user message looks like a repair/correction
 */
export function looksLikeRepair(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  return REPAIR_CUES.some((cue) => normalized.startsWith(cue) || normalized.includes(cue));
}

/**
 * Attempt to parse which slot the user wants to repair
 * Returns null if unclear
 */
export function parseRepairSlot(text: string): SecretarySlot | null {
  const normalized = text.toLowerCase().trim();

  if (normalized.includes('state')) {
    return 'state';
  }

  if (normalized.includes('county')) {
    return 'county';
  }

  if (normalized.includes('city') || normalized.includes('town') || normalized.includes('place')) {
    return 'place';
  }

  if (normalized.includes('description') || normalized.includes('issue')) {
    return 'issue_description';
  }

  if (normalized.includes('category')) {
    return 'issue_category';
  }

  // Unclear which slot to repair
  return null;
}

/**
 * Apply a repair update to slots
 */
export function applyRepair(
  slots: any,
  slotToRepair: SecretarySlot,
  newValue: any
): void {
  // Clear the slot
  slots[slotToRepair] = newValue;

  // Clear dependent slots
  clearDependentSlots(slots, slotToRepair);
}
