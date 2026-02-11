/**
 * Secretary conversation context/state container.
 * Manages state separate from UI components for testability.
 */

import type { SecretaryContext, NodeId } from '../flow/types';
import { createEmptySlotBag, clearSlot, clearDependentSlots } from '../intent/slotState';
import type { SecretarySlot } from '../intent/types';

/**
 * Create initial empty context
 */
export function createInitialContext(): SecretaryContext {
  return {
    selectedState: null,
    selectedCounty: null,
    selectedPlace: null,
    reportIssueDescription: '',
    reportIssueTopIssues: [],
    reportIssueGeographyLevel: null,
    reportIssueGeographyId: null,
    activeIntent: null,
    slots: createEmptySlotBag(),
    messages: [],
    currentNode: 'menu',
    lastUserInput: '',
  };
}

/**
 * Reset context to initial state
 */
export function resetContext(context: SecretaryContext): void {
  context.selectedState = null;
  context.selectedCounty = null;
  context.selectedPlace = null;
  context.reportIssueDescription = '';
  context.reportIssueTopIssues = [];
  context.reportIssueGeographyLevel = null;
  context.reportIssueGeographyId = null;
  context.activeIntent = null;
  context.slots = createEmptySlotBag();
  context.messages = [];
  context.currentNode = 'menu';
  context.lastUserInput = '';
}

/**
 * Add a message to the context
 */
export function addMessage(
  context: SecretaryContext,
  role: 'user' | 'assistant',
  content: string
): void {
  context.messages.push({ role, content });
}

/**
 * Clear messages and return to menu
 */
export function returnToMenu(context: SecretaryContext): void {
  context.messages = [];
  context.currentNode = 'menu';
  context.activeIntent = null;
  context.slots = createEmptySlotBag();
}

/**
 * Reset discovery flow state
 */
export function resetDiscoveryState(context: SecretaryContext): void {
  context.selectedState = null;
  context.selectedCounty = null;
  context.selectedPlace = null;
}

/**
 * Reset report issue flow state
 */
export function resetReportIssueState(context: SecretaryContext): void {
  context.reportIssueDescription = '';
  context.reportIssueTopIssues = [];
  context.reportIssueGeographyLevel = null;
  context.reportIssueGeographyId = null;
}

/**
 * Reset a single slot without wiping conversation
 */
export function resetSlot(context: SecretaryContext, slot: SecretarySlot): void {
  clearSlot(context.slots, slot);
}

/**
 * Reset a slot and its dependents without wiping conversation
 */
export function resetSlotWithDependents(context: SecretaryContext, slot: SecretarySlot): void {
  clearSlot(context.slots, slot);
  clearDependentSlots(context.slots, slot);
}
