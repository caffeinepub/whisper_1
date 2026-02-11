/**
 * SecretaryBrain interface/abstraction.
 * Defines methods for handling user input, actions, and retrieving view models.
 * Includes hook points for observing flow events and injecting actions/destinations.
 */

import type { NodeViewModel, FlowEvent, FlowEventListener, Action, SecretaryContext } from '../flow/types';

/**
 * Secretary "brain" abstraction - the UI depends on this interface
 */
export interface SecretaryBrain {
  /**
   * Initialize or reset the brain
   */
  reset(): void;

  /**
   * Handle user text input
   */
  handleUserText(text: string): Promise<void>;

  /**
   * Handle a UI action (button click, selection, etc.)
   */
  handleAction(action: Action): Promise<void>;

  /**
   * Get the current view model for rendering
   */
  getViewModel(): NodeViewModel;

  /**
   * Get all messages for display
   */
  getMessages(): Array<{ role: 'user' | 'assistant'; content: string }>;

  /**
   * Check if currently showing menu
   */
  isShowingMenu(): boolean;

  /**
   * Register a flow event listener
   */
  addListener(listener: FlowEventListener): void;

  /**
   * Remove a flow event listener
   */
  removeListener(listener: FlowEventListener): void;

  /**
   * Get available typeahead options (if applicable)
   */
  getTypeaheadOptions(): Array<{ id: string; label: string; data: any }>;

  /**
   * Get available suggestions (if applicable)
   */
  getSuggestions(): string[];

  /**
   * Get the current context (for external inspection)
   */
  getContext(): SecretaryContext;
}

/**
 * Navigation request event
 */
export interface NavigationRequest {
  destinationId: string;
  shouldClose: boolean;
}

/**
 * Navigation handler callback
 */
export type NavigationHandler = (request: NavigationRequest) => void;
