/**
 * Barrel export module providing a single discoverable entry point
 * for the intent/slot system.
 */

export { classifyIntent } from './intentClassifier';
export { initializeFlowRegistry, getFlowDefinition, getNavigationHandler } from './flowRegistry';
export { getNextMissingSlot, areAllRequiredSlotsFilled, fillSlot } from './flowRunner';
export { getSlotPrompt } from './flowRunner';
export { executeCompletion } from './flowRunner';
export { looksLikeRepair, parseRepairSlot, applyRepair } from './repair';
export { lookupUSGeographyFromText } from './geographyLookup';
export type { SecretaryIntent, SecretarySlot, SlotBag, IntentContext } from './types';
