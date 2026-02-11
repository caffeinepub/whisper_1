/**
 * Core flow-engine types for the Secretary assistant.
 * Defines nodes, transitions, actions, context, and view models.
 */

import type { USState, USCounty, USPlace, USHierarchyLevel } from '@/backend';
import type { SecretaryIntent, SlotBag } from '../intent/types';

/**
 * Node IDs representing distinct states in the Secretary conversation flow
 */
export type NodeId =
  | 'menu'
  | 'discovery-select-state'
  | 'discovery-select-location'
  | 'discovery-result'
  | 'discovery-top-issues'
  | 'report-loading'
  | 'report-top-issues'
  | 'report-collect-description'
  | 'report-show-suggestions'
  | 'report-custom-category'
  | 'report-complete'
  | 'unknown-input-recovery'
  | 'intent-slot-filling';

/**
 * Action types that can trigger transitions
 */
export type ActionType =
  | 'menu-option'
  | 'state-selected'
  | 'location-selected'
  | 'view-top-issues'
  | 'report-issue'
  | 'top-issue-selected'
  | 'description-submitted'
  | 'suggestion-selected'
  | 'something-else'
  | 'custom-category-submitted'
  | 'back-to-menu'
  | 'navigate-external'
  | 'free-text-input'
  | 'intent-recognized'
  | 'slot-filled';

/**
 * Action payload for triggering transitions
 */
export interface Action {
  type: ActionType;
  payload?: any;
}

/**
 * Transition definition: given current node and action, determine next node
 */
export interface Transition {
  from: NodeId;
  action: ActionType;
  to: NodeId | ((context: SecretaryContext, payload?: any) => NodeId);
  guard?: (context: SecretaryContext, payload?: any) => boolean;
}

/**
 * Node definition with rendering instructions
 */
export interface NodeDefinition {
  id: NodeId;
  onEnter?: (context: SecretaryContext) => Promise<void> | void;
  onExit?: (context: SecretaryContext) => Promise<void> | void;
  getViewModel: (context: SecretaryContext) => NodeViewModel;
}

/**
 * Secretary conversation context/state
 */
export interface SecretaryContext {
  // Discovery flow state
  selectedState: USState | null;
  selectedCounty: USCounty | null;
  selectedPlace: USPlace | null;

  // Report issue flow state
  reportIssueDescription: string;
  reportIssueTopIssues: string[];
  reportIssueGeographyLevel: USHierarchyLevel | null;
  reportIssueGeographyId: string | null;

  // Intent/slot flow state
  activeIntent: SecretaryIntent;
  slots: SlotBag;

  // Message history
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;

  // Current node
  currentNode: NodeId;

  // Last user input (for recovery)
  lastUserInput: string;
}

/**
 * View model produced by nodes for UI rendering
 */
export interface NodeViewModel {
  // Assistant messages to display
  assistantMessages: string[];

  // Input controls to show
  showTextInput: boolean;
  textInputPlaceholder?: string;

  // Typeahead control
  showTypeahead: boolean;
  typeaheadOptions?: Array<{ id: string; label: string; data: any }>;
  typeaheadPlaceholder?: string;

  // Action buttons
  buttons: Array<{
    label: string;
    action: Action;
    variant?: 'default' | 'outline' | 'ghost';
    icon?: string;
  }>;

  // Top issues display
  showTopIssues: boolean;
  topIssues?: string[];

  // Suggestions display
  showSuggestions: boolean;
  suggestions?: string[];
}

/**
 * Flow event for observability hooks
 */
export interface FlowEvent {
  type: 'node-entered' | 'action-taken' | 'navigation-requested';
  nodeId?: NodeId;
  action?: Action;
  navigationId?: string;
  timestamp: number;
}

/**
 * Flow event listener
 */
export type FlowEventListener = (event: FlowEvent) => void;
