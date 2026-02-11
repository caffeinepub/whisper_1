/**
 * Intent/slot mini-runner that:
 * 1. Determines the next missing slot from the active flow
 * 2. Emits a prompt/view-model request
 * 3. Consumes user input/actions to fill slots
 * 4. Triggers completion when all required slots are filled
 */

import type { SecretaryContext } from '../flow/types';
import type { SecretaryIntent, SecretarySlot, SlotBag } from './types';
import { getFlow } from './flowRegistry';
import { isSlotFilled, setSlot } from './slotState';
import { addMessage } from '../state/secretaryContext';

/**
 * Get the next missing required slot for the active intent
 */
export function getNextMissingSlot(
  intent: SecretaryIntent,
  slots: SlotBag
): SecretarySlot | null {
  const flow = getFlow(intent);
  if (!flow) return null;

  // Check required slots in prompt order
  for (const slot of flow.promptOrder) {
    if (flow.requiredSlots.includes(slot) && !isSlotFilled(slots, slot)) {
      return slot;
    }
  }

  return null;
}

/**
 * Check if all required slots are filled for the active intent
 */
export function areAllRequiredSlotsFilled(
  intent: SecretaryIntent,
  slots: SlotBag
): boolean {
  const flow = getFlow(intent);
  if (!flow) return false;

  return flow.requiredSlots.every((slot) => isSlotFilled(slots, slot));
}

/**
 * Get a prompt for the next missing slot
 */
export function getSlotPrompt(slot: SecretarySlot, context: SecretaryContext): string {
  switch (slot) {
    case 'state':
      return 'Which state would you like to explore?';
    case 'county':
      if (context.slots.state) {
        return `Great! Now, which county in ${context.slots.state.longName} would you like to explore?`;
      }
      return 'Which county would you like to explore?';
    case 'place':
      if (context.slots.county) {
        return `Which city or town in ${context.slots.county.fullName}?`;
      }
      return 'Which city or town would you like to explore?';
    case 'issue_description':
      return 'Please describe the issue you\'d like to report:';
    case 'issue_category':
      return 'Based on your description, here are some suggested categories:';
    default:
      return 'Please provide more information:';
  }
}

/**
 * Fill a slot with a value
 */
export function fillSlot(
  slots: SlotBag,
  slot: SecretarySlot,
  value: any
): void {
  setSlot(slots, slot, value);
}

/**
 * Execute the completion action for an intent
 */
export function executeCompletion(
  intent: SecretaryIntent,
  context: SecretaryContext
): void {
  const flow = getFlow(intent);
  if (!flow) return;

  flow.completionAction(context);
}
