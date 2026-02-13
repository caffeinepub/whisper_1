/**
 * Core flow-engine types for the Secretary assistant.
 * Defines nodes, transitions, actions, context, and view models.
 * Extended with guided report-issue flow nodes, confirmation step support, textarea control for multi-line issue description input,
 * issueCategory dropdown support for the guided report category step, and hierarchical location selector with stable locationId and locationLabel.
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
  | 'intent-slot-filling'
  | 'guided-report-title'
  | 'guided-report-location'
  | 'guided-report-category'
  | 'guided-report-details'
  | 'guided-report-confirmation';

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
  | 'slot-filled'
  | 'guided-title-submitted'
  | 'guided-location-selected'
  | 'guided-category-selected'
  | 'guided-details-submitted'
  | 'guided-confirm-submit'
  | 'guided-edit-title'
  | 'guided-edit-location'
  | 'guided-edit-category'
  | 'guided-edit-details';

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
 * Guided report-issue draft state with stable locationId and locationLabel
 */
export interface GuidedReportDraft {
  issueTitle: string;
  location: {
    state: USState | null;
    county: USCounty | null;
    place: USPlace | null;
  };
  locationId: string;
  locationLabel: string;
  category: string;
  details: string;
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
  reportIssueSuggestions: string[];

  // Guided report-issue draft
  guidedReportDraft: GuidedReportDraft;

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

  // Textarea control for multi-line input
  showTextarea: boolean;
  textareaPlaceholder?: string;

  // Typeahead control
  showTypeahead: boolean;
  typeaheadOptions?: Array<{ id: string; label: string; data: any }>;
  typeaheadPlaceholder?: string;

  // Category dropdown control
  showCategoryDropdown: boolean;
  categoryDropdownOptions?: string[];
  categoryDropdownPlaceholder?: string;
  categoryDropdownLabel?: string;

  // Hierarchical location selector control
  showHierarchicalLocationSelector: boolean;

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

  // Confirmation summary display
  showConfirmationSummary: boolean;
  confirmationSummary?: {
    title: string;
    location: string;
    category: string;
    details: string;
  };
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
