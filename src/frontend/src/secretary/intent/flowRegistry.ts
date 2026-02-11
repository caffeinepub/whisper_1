/**
 * Centralized flow registry mapping each intent to required slots,
 * prompt order, and completion actions with extension hooks for future intents.
 */

import type { SecretaryIntent, SecretarySlot } from './types';
import type { NavigationHandler } from '../brain/SecretaryBrain';

export interface IntentFlowDefinition {
  requiredSlots: SecretarySlot[];
  optionalSlots: SecretarySlot[];
  slotOrder: SecretarySlot[];
}

const flowRegistry: Record<SecretaryIntent & string, IntentFlowDefinition> = {
  report_issue: {
    requiredSlots: ['state', 'issue_description', 'issue_category'],
    optionalSlots: ['county', 'place'],
    slotOrder: ['state', 'county', 'place', 'issue_description', 'issue_category'],
  },
  find_instance: {
    requiredSlots: ['state'],
    optionalSlots: ['county', 'place'],
    slotOrder: ['state', 'county', 'place'],
  },
  create_instance: {
    requiredSlots: ['state'],
    optionalSlots: ['county', 'place'],
    slotOrder: ['state', 'county', 'place'],
  },
  ask_category: {
    requiredSlots: ['state'],
    optionalSlots: ['county', 'place'],
    slotOrder: ['state', 'county', 'place'],
  },
  top_issues: {
    requiredSlots: ['state'],
    optionalSlots: ['county', 'place'],
    slotOrder: ['state', 'county', 'place'],
  },
};

let navigationHandler: NavigationHandler | null = null;

/**
 * Initialize the flow registry with navigation handler
 */
export function initializeFlowRegistry(handler: NavigationHandler): void {
  navigationHandler = handler;
}

/**
 * Get the flow definition for an intent
 */
export function getFlowDefinition(intent: SecretaryIntent): IntentFlowDefinition | null {
  if (!intent) return null;
  return flowRegistry[intent] || null;
}

/**
 * Get navigation handler
 */
export function getNavigationHandler(): NavigationHandler | null {
  return navigationHandler;
}
