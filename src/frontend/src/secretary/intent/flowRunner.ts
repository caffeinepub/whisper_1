/**
 * Intent/slot mini-runner that determines next missing slots, emits prompts,
 * consumes user input to fill slots, and triggers completion when all required slots are filled.
 * 
 * Secretary-triggered create actions route through the same UI flows that call
 * the standardized contribution logging helper, ensuring consistent behavior.
 */

import type { SecretaryIntent, SecretarySlot, SlotBag } from './types';
import type { SecretaryContext } from '../flow/types';
import type { NavigationHandler } from '../brain/SecretaryBrain';
import { getFlowDefinition, getNavigationHandler } from './flowRegistry';
import { isSlotFilled, setSlot } from './slotState';
import { buildSlotPrompt } from '../copy/secretaryPrompts';

/**
 * Get the next missing required slot for an intent
 */
export function getNextMissingSlot(
  intent: SecretaryIntent,
  slots: SlotBag
): SecretarySlot | null {
  const flow = getFlowDefinition(intent);
  if (!flow) return null;

  // Check required slots in order
  for (const slot of flow.slotOrder) {
    if (flow.requiredSlots.includes(slot) && !isSlotFilled(slots, slot)) {
      return slot;
    }
  }

  return null;
}

/**
 * Check if all required slots are filled
 */
export function areAllRequiredSlotsFilled(
  intent: SecretaryIntent,
  slots: SlotBag
): boolean {
  const flow = getFlowDefinition(intent);
  if (!flow) return false;

  return flow.requiredSlots.every(slot => isSlotFilled(slots, slot));
}

/**
 * Fill a slot with a value
 */
export function fillSlot<K extends SecretarySlot>(
  slots: SlotBag,
  slotName: K,
  value: SlotBag[K]
): void {
  setSlot(slots, slotName, value);
}

/**
 * Get a prompt for a slot
 */
export function getSlotPrompt(slot: SecretarySlot, context: SecretaryContext): string {
  return buildSlotPrompt(slot, context.slots.state, context.slots.county);
}

/**
 * Execute completion action for an intent
 */
export function executeCompletion(
  intent: SecretaryIntent,
  slots: SlotBag,
  navigationHandler: NavigationHandler
): void {
  const flow = getFlowDefinition(intent);
  if (!flow || !flow.onComplete) return;

  flow.onComplete(slots, navigationHandler);
}
