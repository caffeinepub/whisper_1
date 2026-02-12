/**
 * Intent/slot mini-runner that determines next missing slots, emits prompts,
 * consumes user input to fill slots, and triggers completion when all required slots are filled.
 * 
 * Secretary-triggered create actions route through the same UI flows that call
 * the standardized contribution logging helper, ensuring consistent behavior.
 */

import type { SecretaryIntent, SecretarySlot, SlotBag } from './types';
import type { SecretaryContext } from '../flow/types';
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
 * Execute completion action for an intent.
 * Routes through the same UI flows that call the standardized contribution
 * logging helper, ensuring Secretary-triggered actions also log contributions.
 */
export function executeCompletion(intent: SecretaryIntent, context: SecretaryContext): void {
  const handler = getNavigationHandler();
  
  switch (intent) {
    case 'report_issue':
      // Navigate to proposals with category
      // The proposals UI will handle issue creation and contribution logging
      if (handler) {
        handler({ destinationId: 'proposals', shouldClose: true });
      }
      break;
      
    case 'create_instance':
      // Navigate to create-instance form
      // The form will handle proposal creation and contribution logging
      if (handler) {
        handler({ destinationId: 'create-instance', shouldClose: true });
      }
      break;
      
    case 'find_instance':
      // Already handled in brain
      break;
      
    case 'ask_category':
      // Show categories (already displayed)
      break;
      
    case 'top_issues':
      // Already handled in brain
      break;
  }
}
