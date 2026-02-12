/**
 * Centralized flow registry mapping each intent to required slots,
 * prompt order, and completion actions with extension hooks for future intents.
 * Extended with task management intent flows (create_task, find_tasks, update_task).
 */

import type { SecretaryIntent, SecretarySlot, SlotBag } from './types';
import type { NavigationHandler } from '../brain/SecretaryBrain';

export interface IntentFlowDefinition {
  requiredSlots: SecretarySlot[];
  optionalSlots: SecretarySlot[];
  slotOrder: SecretarySlot[];
  onComplete?: (slots: SlotBag, navigationHandler: NavigationHandler) => Promise<void> | void;
}

const flowRegistry: Partial<Record<NonNullable<SecretaryIntent>, IntentFlowDefinition>> = {
  report_issue: {
    requiredSlots: ['state', 'issue_category', 'issue_description'],
    optionalSlots: ['county', 'place'],
    slotOrder: ['state', 'county', 'place', 'issue_category', 'issue_description'],
    onComplete: (slots, navigationHandler) => {
      // Navigate to proposals page with reporting mode
      navigationHandler({ destinationId: 'proposals', shouldClose: true });
    },
  },
  find_instance: {
    requiredSlots: ['state'],
    optionalSlots: ['county', 'place'],
    slotOrder: ['state', 'county', 'place'],
    onComplete: (slots, navigationHandler) => {
      // Navigate to geography page
      navigationHandler({ destinationId: 'geography', shouldClose: true });
    },
  },
  create_instance: {
    requiredSlots: ['state'],
    optionalSlots: ['county', 'place'],
    slotOrder: ['state', 'county', 'place'],
    onComplete: (slots, navigationHandler) => {
      // Navigate to proposals page with create mode
      navigationHandler({ destinationId: 'proposals', shouldClose: true });
    },
  },
  top_issues: {
    requiredSlots: ['state'],
    optionalSlots: ['county', 'place'],
    slotOrder: ['state', 'county', 'place'],
    onComplete: (slots, navigationHandler) => {
      // Navigate to proposals page
      navigationHandler({ destinationId: 'proposals', shouldClose: true });
    },
  },
  create_task: {
    requiredSlots: ['task_title', 'task_description', 'task_location_id'],
    optionalSlots: ['task_category'],
    slotOrder: ['task_location_id', 'task_title', 'task_description', 'task_category'],
    onComplete: async (slots, navigationHandler) => {
      // Task creation will be handled by taskIntentActions
      // This is a placeholder for the completion hook
    },
  },
  find_tasks: {
    requiredSlots: ['task_location_id'],
    optionalSlots: [],
    slotOrder: ['task_location_id'],
    onComplete: async (slots, navigationHandler) => {
      // Task listing will be handled by taskIntentActions
      // This is a placeholder for the completion hook
    },
  },
  update_task: {
    requiredSlots: ['task_id', 'task_location_id', 'task_status'],
    optionalSlots: [],
    slotOrder: ['task_location_id', 'task_id', 'task_status'],
    onComplete: async (slots, navigationHandler) => {
      // Task update will be handled by taskIntentActions
      // This is a placeholder for the completion hook
    },
  },
};

let navigationHandlerRef: NavigationHandler | null = null;

export function initializeFlowRegistry(navigationHandler: NavigationHandler): void {
  navigationHandlerRef = navigationHandler;
}

export function getNavigationHandler(): NavigationHandler | null {
  return navigationHandlerRef;
}

export function getFlowDefinition(intent: SecretaryIntent): IntentFlowDefinition | null {
  if (!intent) return null;
  return flowRegistry[intent] || null;
}
