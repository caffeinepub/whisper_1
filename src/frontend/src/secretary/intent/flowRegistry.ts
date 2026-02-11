/**
 * Centralized flow registry mapping intent -> required slots, prompt order, and completion action.
 * Provides extension hooks for future intents.
 */

import type { SecretaryIntent, SecretarySlot } from './types';
import type { SecretaryContext } from '../flow/types';

/**
 * Flow definition for an intent
 */
export interface IntentFlow {
  intent: SecretaryIntent;
  requiredSlots: SecretarySlot[];
  promptOrder: SecretarySlot[];
  completionAction: (context: SecretaryContext) => void;
}

/**
 * Navigation handler type
 */
type NavigationHandler = (request: { destinationId: string; shouldClose: boolean }) => void;

/**
 * Registry of intent flows
 */
const flowRegistry: Map<SecretaryIntent, IntentFlow> = new Map();

/**
 * Register the report_issue flow
 */
export function registerReportIssueFlow(navigationHandler: NavigationHandler | null): void {
  flowRegistry.set('report_issue', {
    intent: 'report_issue',
    requiredSlots: ['state', 'issue_description', 'issue_category'],
    promptOrder: ['state', 'county', 'place', 'issue_description', 'issue_category'],
    completionAction: (context) => {
      // Trigger navigation to issue project
      if (navigationHandler) {
        // Signal that we want to create an issue project
        // This will be handled by the existing project navigation system
      }
    },
  });
}

/**
 * Register the create_instance flow
 */
export function registerCreateInstanceFlow(navigationHandler: NavigationHandler | null): void {
  flowRegistry.set('create_instance', {
    intent: 'create_instance',
    requiredSlots: ['state', 'county'],
    promptOrder: ['state', 'county', 'place'],
    completionAction: (context) => {
      // Navigate to create instance page
      if (navigationHandler) {
        navigationHandler({ destinationId: 'create-instance', shouldClose: true });
      }
    },
  });
}

/**
 * Register the find_instance flow
 */
export function registerFindInstanceFlow(navigationHandler: NavigationHandler | null): void {
  flowRegistry.set('find_instance', {
    intent: 'find_instance',
    requiredSlots: ['state'],
    promptOrder: ['state', 'county', 'place'],
    completionAction: (context) => {
      // Route to discovery/top-issues for the filled geography
      // This will use the existing discovery flow completion
    },
  });
}

/**
 * Register the ask_category flow
 */
export function registerAskCategoryFlow(navigationHandler: NavigationHandler | null): void {
  flowRegistry.set('ask_category', {
    intent: 'ask_category',
    requiredSlots: ['state'],
    promptOrder: ['state'],
    completionAction: (context) => {
      // Show categories for the selected geography level
      // This will display the category list
    },
  });
}

/**
 * Get a flow definition by intent
 */
export function getFlow(intent: SecretaryIntent): IntentFlow | undefined {
  if (!intent) return undefined;
  return flowRegistry.get(intent);
}

/**
 * Get all registered flows
 */
export function getAllFlows(): IntentFlow[] {
  return Array.from(flowRegistry.values());
}

/**
 * Initialize all flows
 */
export function initializeFlowRegistry(navigationHandler: NavigationHandler | null): void {
  registerReportIssueFlow(navigationHandler);
  registerCreateInstanceFlow(navigationHandler);
  registerFindInstanceFlow(navigationHandler);
  registerAskCategoryFlow(navigationHandler);
}
