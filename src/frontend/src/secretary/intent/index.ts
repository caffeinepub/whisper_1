/**
 * Barrel export module for the intent/slot system.
 * Provides single discoverable entry point for intent classification,
 * slot management, flow registry, and geography lookup.
 */

export { classifyIntent } from './intentClassifier';
export { getFlowDefinition, initializeFlowRegistry, getNavigationHandler } from './flowRegistry';
export {
  getNextMissingSlot,
  areAllRequiredSlotsFilled,
  fillSlot,
  getSlotPrompt,
  executeCompletion,
} from './flowRunner';
export {
  getSlot,
  setSlot,
  clearSlot,
  clearDependentSlots,
  isSlotFilled,
  createEmptySlotBag,
} from './slotState';
export {
  lookupUSStateFromText,
  lookupUSCountyFromText,
  lookupUSPlaceFromText,
  lookupUSGeographyFromText,
  resolveLocationIdFromSlots,
} from './geographyLookup';
export { executeTaskIntent } from './taskExecutor';
export { parseTaskId, parseTaskStatus, deriveLocationId, parseLocationId } from './taskSlotParsing';
export type { SecretaryIntent, SecretarySlot, SlotBag, IntentContext } from './types';
export type { IntentFlowDefinition } from './flowRegistry';
