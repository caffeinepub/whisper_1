/**
 * Flow runner/controller that advances the current node based on user text or UI actions.
 * Produces assistant messages and UI state, calls existing canister actor capabilities.
 */

import type { SecretaryContext, NodeId, NodeViewModel, Action } from './types';
import { nodeDefinitions, transitions } from './flows';
import { secretaryCopy } from '../copy/secretaryCopy';
import { createEmptySlotBag } from '../intent/slotState';
import type { backendInterface } from '@/backend';

export type FlowRunnerListener = (viewModel: NodeViewModel) => void;

export class FlowRunner {
  private context: SecretaryContext;
  private actor: backendInterface | null;
  private listeners: Set<FlowRunnerListener> = new Set();

  constructor(actor: backendInterface | null, context: SecretaryContext) {
    this.actor = actor;
    this.context = context;
  }

  addListener(listener: FlowRunnerListener): void {
    this.listeners.add(listener);
  }

  removeListener(listener: FlowRunnerListener): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(viewModel: NodeViewModel): void {
    this.listeners.forEach((listener) => listener(viewModel));
  }

  getCurrentViewModel(): NodeViewModel {
    const currentNode = nodeDefinitions[this.context.currentNode];
    if (!currentNode) {
      console.error(`Node ${this.context.currentNode} not found`);
      return this.getDefaultViewModel();
    }
    return currentNode.getViewModel(this.context);
  }

  getViewModel(): NodeViewModel {
    return this.getCurrentViewModel();
  }

  private getDefaultViewModel(): NodeViewModel {
    return {
      assistantMessages: [],
      showTextInput: false,
      showTypeahead: false,
      buttons: [],
      showTopIssues: false,
      showSuggestions: false,
    };
  }

  async handleInput(userText: string): Promise<void> {
    // Input handling is delegated to the brain
    console.warn('handleInput called on FlowRunner - should be handled by brain');
  }

  async handleAction(action: Action): Promise<void> {
    const currentNodeId = this.context.currentNode;
    
    // Find matching transition
    const transition = transitions.find(
      (t) => t.from === currentNodeId && t.action === action.type
    );

    if (!transition) {
      console.warn(`No transition found for action ${action.type} from node ${currentNodeId}`);
      return;
    }

    // Determine target node
    let targetNodeId: NodeId;
    if (typeof transition.to === 'function') {
      targetNodeId = transition.to(this.context, action.payload);
    } else {
      targetNodeId = transition.to;
    }

    // Check guard if present
    if (transition.guard && !transition.guard(this.context, action.payload)) {
      return;
    }

    await this.transitionTo(targetNodeId);
  }

  private async transitionTo(targetNodeId: NodeId): Promise<void> {
    const targetNode = nodeDefinitions[targetNodeId];
    if (!targetNode) {
      console.error(`Node ${targetNodeId} not found`);
      return;
    }

    // Execute onExit hook if present
    const currentNode = nodeDefinitions[this.context.currentNode];
    if (currentNode?.onExit) {
      await currentNode.onExit(this.context);
    }

    // Update current node
    this.context.currentNode = targetNodeId;

    // Execute onEnter hook if present
    if (targetNode.onEnter) {
      await targetNode.onEnter(this.context);
    }

    const viewModel = this.getCurrentViewModel();
    this.notifyListeners(viewModel);
  }

  getContext(): SecretaryContext {
    return this.context;
  }

  setActor(actor: backendInterface | null): void {
    this.actor = actor;
  }
}
