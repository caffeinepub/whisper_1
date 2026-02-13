/**
 * Secretary conversation context/state container.
 * Manages state separate from UI components for testability.
 * Extended with guided report-issue draft state management including stable locationId and locationLabel.
 */

import type { SecretaryContext, NodeId, GuidedReportDraft } from '../flow/types';
import { createEmptySlotBag, clearSlot, clearDependentSlots } from '../intent/slotState';
import type { SecretarySlot } from '../intent/types';

/**
 * Create initial empty guided report draft with stable locationId and locationLabel
 */
function createEmptyGuidedReportDraft(): GuidedReportDraft {
  return {
    issueTitle: '',
    location: {
      state: null,
      county: null,
      place: null,
    },
    locationId: '',
    locationLabel: '',
    category: '',
    details: '',
  };
}

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
    reportIssueSuggestions: [],
    guidedReportDraft: createEmptyGuidedReportDraft(),
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
  context.reportIssueSuggestions = [];
  context.guidedReportDraft = createEmptyGuidedReportDraft();
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
  context.guidedReportDraft = createEmptyGuidedReportDraft();
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
  context.reportIssueSuggestions = [];
}

/**
 * Reset guided report draft
 */
export function resetGuidedReportDraft(context: SecretaryContext): void {
  context.guidedReportDraft = createEmptyGuidedReportDraft();
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
