/**
 * Flow runner/controller that executes transitions and manages state.
 * Handles node entry/exit, action processing, and view model generation.
 * Extended with textarea field support in default view model for multi-line issue description input.
 * Provides FlowRunner class wrapper for compatibility with FlowEngineBrain.
 */

import type {
  SecretaryContext,
  NodeId,
  Action,
  NodeDefinition,
  Transition,
  NodeViewModel,
  FlowEvent,
  FlowEventListener,
} from './types';
import { nodeDefinitions, transitions } from './flows';
import type { backendInterface } from '@/backend';

/**
 * Execute a transition from current node given an action
 */
export function executeTransition(
  context: SecretaryContext,
  action: Action
): NodeId | null {
  const currentNode = context.currentNode;

  // Find matching transition
  const transition = transitions.find(
    (t) => t.from === currentNode && t.action === action.type
  );

  if (!transition) {
    return null;
  }

  // Check guard if present
  if (transition.guard && !transition.guard(context, action.payload)) {
    return null;
  }

  // Determine next node
  const nextNode =
    typeof transition.to === 'function'
      ? transition.to(context, action.payload)
      : transition.to;

  return nextNode;
}

/**
 * Enter a node (run onEnter hook)
 */
export async function enterNode(
  context: SecretaryContext,
  nodeId: NodeId
): Promise<void> {
  const nodeDef = nodeDefinitions[nodeId];
  if (!nodeDef) {
    throw new Error(`Node definition not found: ${nodeId}`);
  }

  context.currentNode = nodeId;

  if (nodeDef.onEnter) {
    await nodeDef.onEnter(context);
  }
}

/**
 * Exit a node (run onExit hook)
 */
export async function exitNode(
  context: SecretaryContext,
  nodeId: NodeId
): Promise<void> {
  const nodeDef = nodeDefinitions[nodeId];
  if (!nodeDef) {
    return;
  }

  if (nodeDef.onExit) {
    await nodeDef.onExit(context);
  }
}

/**
 * Get view model for current node
 */
export function getNodeViewModel(context: SecretaryContext): NodeViewModel {
  const nodeDef = nodeDefinitions[context.currentNode];
  if (!nodeDef) {
    // Return default view model if node not found
    return {
      assistantMessages: [],
      showTextInput: true,
      textInputPlaceholder: 'Type your message...',
      showTextarea: false,
      showTypeahead: false,
      buttons: [],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    };
  }

  return nodeDef.getViewModel(context);
}

/**
 * Process an action and transition to next node
 */
export async function processAction(
  context: SecretaryContext,
  action: Action,
  eventListener?: FlowEventListener
): Promise<boolean> {
  const currentNode = context.currentNode;

  // Execute transition
  const nextNode = executeTransition(context, action);

  if (!nextNode) {
    return false;
  }

  // Exit current node
  await exitNode(context, currentNode);

  // Enter next node
  await enterNode(context, nextNode);

  // Emit event
  if (eventListener) {
    eventListener({
      type: 'action-taken',
      nodeId: nextNode,
      action,
      timestamp: Date.now(),
    });
  }

  return true;
}

/**
 * FlowRunner listener type for compatibility
 */
export type FlowRunnerListener = (viewModel: NodeViewModel) => void;

/**
 * FlowRunner class wrapper for compatibility with FlowEngineBrain
 */
export class FlowRunner {
  private context: SecretaryContext;
  private actor: backendInterface | null;
  private listeners: FlowRunnerListener[] = [];

  constructor(actor: backendInterface | null, context: SecretaryContext) {
    this.actor = actor;
    this.context = context;
  }

  /**
   * Get current context
   */
  getContext(): SecretaryContext {
    return this.context;
  }

  /**
   * Set actor for backend calls
   */
  setActor(actor: backendInterface | null): void {
    this.actor = actor;
  }

  /**
   * Get current view model
   */
  getViewModel(): NodeViewModel {
    return getNodeViewModel(this.context);
  }

  /**
   * Handle user input
   */
  async handleInput(text: string): Promise<void> {
    // This is a placeholder - actual implementation is in FlowEngineBrain
    // which handles the input processing logic
  }

  /**
   * Handle action
   */
  async handleAction(action: Action): Promise<void> {
    await processAction(this.context, action);
    this.notifyListeners();
  }

  /**
   * Add listener
   */
  addListener(listener: FlowRunnerListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: FlowRunnerListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const vm = this.getViewModel();
    this.listeners.forEach(listener => listener(vm));
  }
}
