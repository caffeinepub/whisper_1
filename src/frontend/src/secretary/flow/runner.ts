/**
 * Flow runner/controller that advances the current node based on user text or UI actions.
 * Produces assistant messages and UI state, calls existing canister actor capabilities.
 */

import type {
  SecretaryContext,
  NodeId,
  Action,
  NodeViewModel,
  FlowEvent,
  FlowEventListener,
} from './types';
import { nodeDefinitions, transitions } from './flows';
import { addMessage, resetDiscoveryState, resetReportIssueState } from '../state/secretaryContext';
import { decideReportIssueNextNode } from '../decisions/secretaryDecisions';
import type { backendInterface } from '@/backend';

/**
 * Flow runner manages state transitions and produces view models
 */
export class FlowRunner {
  private context: SecretaryContext;
  private actor: backendInterface | null;
  private listeners: FlowEventListener[] = [];

  constructor(context: SecretaryContext, actor: backendInterface | null) {
    this.context = context;
    this.actor = actor;
  }

  /**
   * Register a flow event listener
   */
  addListener(listener: FlowEventListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a flow event listener
   */
  removeListener(listener: FlowEventListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  /**
   * Emit a flow event to all listeners
   */
  private emitEvent(event: FlowEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  /**
   * Get the current node view model
   */
  getViewModel(): NodeViewModel {
    const node = nodeDefinitions[this.context.currentNode];
    if (!node) {
      console.error(`Unknown node: ${this.context.currentNode}`);
      return this.getDefaultViewModel();
    }
    return node.getViewModel(this.context);
  }

  /**
   * Get a default fallback view model
   */
  private getDefaultViewModel(): NodeViewModel {
    return {
      assistantMessages: ['Something went wrong. Please return to the menu.'],
      showTextInput: false,
      showTypeahead: false,
      buttons: [
        {
          label: 'Back to Menu',
          action: { type: 'back-to-menu' },
          variant: 'outline',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
    };
  }

  /**
   * Handle an action and transition to the next node
   */
  async handleAction(action: Action): Promise<void> {
    this.emitEvent({
      type: 'action-taken',
      action,
      timestamp: Date.now(),
    });

    // Find matching transition
    const transition = transitions.find(
      (t) => t.from === this.context.currentNode && t.action === action.type
    );

    if (!transition) {
      console.warn(`No transition found for action ${action.type} from node ${this.context.currentNode}`);
      return;
    }

    // Check guard if present
    if (transition.guard && !transition.guard(this.context, action.payload)) {
      return;
    }

    // Determine next node
    const nextNode =
      typeof transition.to === 'function'
        ? transition.to(this.context, action.payload)
        : transition.to;

    // Exit current node
    const currentNode = nodeDefinitions[this.context.currentNode];
    if (currentNode?.onExit) {
      await currentNode.onExit(this.context);
    }

    // Update context
    this.context.currentNode = nextNode;

    // Enter new node
    const newNode = nodeDefinitions[nextNode];
    if (newNode?.onEnter) {
      await newNode.onEnter(this.context);
    }

    this.emitEvent({
      type: 'node-entered',
      nodeId: nextNode,
      timestamp: Date.now(),
    });

    // Handle special node logic
    await this.handleNodeSpecialLogic(nextNode);
  }

  /**
   * Handle special logic for certain nodes (e.g., loading data)
   */
  private async handleNodeSpecialLogic(nodeId: NodeId): Promise<void> {
    switch (nodeId) {
      case 'menu':
        // Reset flow state when returning to menu
        resetDiscoveryState(this.context);
        resetReportIssueState(this.context);
        break;

      case 'report-loading':
        // Auto-load report issue data
        await this.loadReportIssueData();
        break;
    }
  }

  /**
   * Load report issue data and transition to appropriate node
   */
  private async loadReportIssueData(): Promise<void> {
    if (!this.actor) {
      addMessage(this.context, 'assistant', 'Unable to load data. Please try again.');
      await this.handleAction({ type: 'back-to-menu' });
      return;
    }

    try {
      const { reportIssueGeographyLevel, reportIssueGeographyId } = this.context;

      if (reportIssueGeographyLevel && reportIssueGeographyId) {
        // Fetch top issues
        const issues = await this.actor.getTopIssuesForLocation(
          reportIssueGeographyLevel,
          reportIssueGeographyId
        );

        this.context.reportIssueTopIssues = issues.slice(0, 50);

        // Decide next node based on whether we have issues
        const nextNode = decideReportIssueNextNode(this.context);

        if (nextNode === 'report-top-issues') {
          addMessage(
            this.context,
            'assistant',
            'Here are the most common issues in your area. Select one or describe something else:'
          );
        } else {
          addMessage(
            this.context,
            'assistant',
            'No common issues have been recorded for this location yet. Please describe your issue:'
          );
        }

        // Transition to the decided node
        this.context.currentNode = nextNode;
        const node = nodeDefinitions[nextNode];
        if (node?.onEnter) {
          await node.onEnter(this.context);
        }
      } else {
        // No geography, go straight to description
        addMessage(this.context, 'assistant', 'Please describe the issue you\'d like to report:');
        this.context.currentNode = 'report-collect-description';
      }
    } catch (error) {
      console.error('Error loading report issue data:', error);
      addMessage(this.context, 'assistant', 'I\'m having trouble loading issue data. Please try again.');
      await this.handleAction({ type: 'back-to-menu' });
    }
  }

  /**
   * Get the current context (for external inspection)
   */
  getContext(): SecretaryContext {
    return this.context;
  }

  /**
   * Update the actor reference
   */
  setActor(actor: backendInterface | null): void {
    this.actor = actor;
  }
}
