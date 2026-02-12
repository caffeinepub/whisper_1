/**
 * Default in-frontend SecretaryBrain implementation using the flow engine.
 * Extended with task intent integration for create_task, find_tasks, and update_task.
 */

import type { SecretaryBrain, NavigationHandler } from './SecretaryBrain';
import type { NodeViewModel, Action, FlowEventListener, SecretaryContext } from '../flow/types';
import { FlowRunner, type FlowRunnerListener } from '../flow/runner';
import { createInitialContext, addMessage, resetContext } from '../state/secretaryContext';
import type { backendInterface, USState, USCounty, USPlace } from '@/backend';
import { classifyIntent } from '../intent/intentClassifier';
import { getFlowDefinition } from '../intent/flowRegistry';
import { getNextMissingSlot, areAllRequiredSlotsFilled, getSlotPrompt } from '../intent/flowRunner';
import { setSlot, isSlotFilled } from '../intent/slotState';
import { executeTaskIntent } from '../intent/taskExecutor';
import { parseTaskId, parseTaskStatus, deriveLocationId, parseLocationId } from '../intent/taskSlotParsing';
import { lookupUSGeographyFromText, resolveLocationIdFromSlots } from '../intent/geographyLookup';

/**
 * Flow engine-based brain implementation
 */
export class FlowEngineBrain implements SecretaryBrain {
  private runner: FlowRunner;
  private navigationHandler: NavigationHandler | null = null;
  private findByKeyword: ((text: string) => { id: string } | null) | null = null;
  private allStates: USState[] = [];
  private countiesForState: USCounty[] = [];
  private placesForState: USPlace[] = [];
  private complaintSuggestions: string[] = [];
  private listenerAdapters: Map<FlowEventListener, FlowRunnerListener> = new Map();
  private actor: backendInterface | null = null;

  constructor(actor: backendInterface | null) {
    const context = createInitialContext();
    this.runner = new FlowRunner(actor, context);
    this.actor = actor;
    
    // Add initial menu greeting to message history
    addMessage(context, 'assistant', 'Hello! I\'m your Secretary. How can I help you today?');
  }

  /**
   * Set navigation handler for external navigation
   */
  setNavigationHandler(handler: NavigationHandler): void {
    this.navigationHandler = handler;
  }

  /**
   * Set keyword finder for free-text navigation
   */
  setKeywordFinder(finder: (text: string) => { id: string } | null): void {
    this.findByKeyword = finder;
  }

  /**
   * Wire geography data for typeahead
   */
  setGeographyData(states: USState[], countiesForState: USCounty[], placesForState: USPlace[]): void {
    this.allStates = states;
    this.countiesForState = countiesForState;
    this.placesForState = placesForState;
  }

  /**
   * Wire complaint suggestions
   */
  setComplaintSuggestions(suggestions: string[]): void {
    this.complaintSuggestions = suggestions;
    const context = this.runner.getContext();
    context.reportIssueSuggestions = suggestions;
  }

  /**
   * Set actor for backend calls
   */
  setActor(actor: backendInterface | null): void {
    this.runner.setActor(actor);
    this.actor = actor;
  }

  /**
   * Get current view model
   */
  getViewModel(): NodeViewModel {
    const context = this.runner.getContext();
    const currentNode = context.currentNode;
    
    // Build typeahead options based on current node
    let typeaheadOptions: Array<{ id: string; label: string; data: any }> = [];
    
    if (currentNode === 'discovery-select-state') {
      typeaheadOptions = this.allStates.map((state) => ({
        id: state.hierarchicalId,
        label: state.longName,
        data: state,
      }));
    } else if (currentNode === 'discovery-select-location') {
      const combined = [
        ...this.countiesForState.map((county) => ({
          id: county.hierarchicalId,
          label: `${county.shortName} (County)`,
          data: county,
        })),
        ...this.placesForState.map((place) => ({
          id: place.hierarchicalId,
          label: `${place.shortName} (City)`,
          data: place,
        })),
      ];
      typeaheadOptions = combined;
    } else if (currentNode === 'guided-report-location') {
      // Show states initially
      if (!context.guidedReportDraft.location.state) {
        typeaheadOptions = this.allStates.map((state) => ({
          id: state.hierarchicalId,
          label: state.longName,
          data: state,
        }));
      } else {
        // After state is selected, show counties and places for that state
        const combined = [
          ...this.countiesForState.map((county) => ({
            id: county.hierarchicalId,
            label: `${county.shortName} (County)`,
            data: county,
          })),
          ...this.placesForState.map((place) => ({
            id: place.hierarchicalId,
            label: `${place.shortName} (City)`,
            data: place,
          })),
        ];
        typeaheadOptions = combined;
      }
    }
    
    const vm = this.runner.getViewModel();
    return {
      ...vm,
      typeaheadOptions: typeaheadOptions.length > 0 ? typeaheadOptions : vm.typeaheadOptions,
    };
  }

  /**
   * Get message history
   */
  getMessages(): Array<{ role: 'user' | 'assistant'; content: string }> {
    const context = this.runner.getContext();
    return context.messages;
  }

  /**
   * Get current context (for external inspection)
   */
  getContext(): SecretaryContext {
    return this.runner.getContext();
  }

  /**
   * Check if currently showing menu
   */
  isShowingMenu(): boolean {
    const context = this.runner.getContext();
    return context.currentNode === 'menu';
  }

  /**
   * Handle user text input with task intent integration
   */
  async handleUserText(text: string): Promise<void> {
    const context = this.runner.getContext();
    
    // Add user message to history
    addMessage(context, 'user', text);

    // Check if we're in an active task intent flow
    const activeIntent = context.activeIntent;
    if (activeIntent === 'create_task' || activeIntent === 'find_tasks' || activeIntent === 'update_task') {
      await this.handleTaskIntentSlotFilling(text, activeIntent);
      return;
    }

    // Try to classify intent from user text
    const intent = classifyIntent(text);
    
    if (intent === 'create_task' || intent === 'find_tasks' || intent === 'update_task') {
      // Start task intent flow
      context.activeIntent = intent;
      await this.handleTaskIntentSlotFilling(text, intent);
      return;
    }

    // Fall back to existing flow runner
    await this.runner.handleInput(text);
  }

  /**
   * Handle task intent slot filling
   */
  private async handleTaskIntentSlotFilling(text: string, intent: 'create_task' | 'find_tasks' | 'update_task'): Promise<void> {
    const context = this.runner.getContext();
    const slots = context.slots;

    // Try to fill slots from user text
    await this.fillTaskSlotsFromText(text, intent);

    // Check if all required slots are filled
    if (areAllRequiredSlotsFilled(intent, slots)) {
      // Execute the task intent
      const resultMessage = await executeTaskIntent(intent, slots, this.actor);
      addMessage(context, 'assistant', resultMessage);

      // Reset intent and slots
      context.activeIntent = null;
      context.slots = createInitialContext().slots;
      return;
    }

    // Get next missing slot and prompt for it
    const nextSlot = getNextMissingSlot(intent, slots);
    if (nextSlot) {
      const prompt = getSlotPrompt(nextSlot, context);
      addMessage(context, 'assistant', prompt);
    }
  }

  /**
   * Fill task slots from user text
   */
  private async fillTaskSlotsFromText(text: string, intent: 'create_task' | 'find_tasks' | 'update_task'): Promise<void> {
    const context = this.runner.getContext();
    const slots = context.slots;

    // Parse task ID if needed
    if (!isSlotFilled(slots, 'task_id')) {
      const taskId = parseTaskId(text);
      if (taskId) {
        setSlot(slots, 'task_id', taskId);
      }
    }

    // Parse task status if needed
    if (!isSlotFilled(slots, 'task_status')) {
      const status = parseTaskStatus(text);
      if (status) {
        setSlot(slots, 'task_status', status);
      }
    }

    // Parse location ID if needed
    if (!isSlotFilled(slots, 'task_location_id')) {
      // Try to derive from existing geography slots
      const locationId = resolveLocationIdFromSlots(slots.state, slots.county, slots.place);
      if (locationId) {
        setSlot(slots, 'task_location_id', locationId);
      } else {
        // Try to parse from text
        const parsedLocationId = parseLocationId(text);
        if (parsedLocationId) {
          setSlot(slots, 'task_location_id', parsedLocationId);
        } else {
          // Try to look up geography from text
          const geography = await lookupUSGeographyFromText(text, this.actor);
          if (geography.locationId) {
            setSlot(slots, 'task_location_id', geography.locationId);
            if (geography.state) setSlot(slots, 'state', geography.state);
            if (geography.county) setSlot(slots, 'county', geography.county);
            if (geography.place) setSlot(slots, 'place', geography.place);
          }
        }
      }
    }

    // Fill title if needed (for create_task)
    if (intent === 'create_task' && !isSlotFilled(slots, 'task_title')) {
      // Use the text as title if it looks like a title (short, no question words)
      const normalized = text.toLowerCase().trim();
      if (
        !normalized.includes('create') &&
        !normalized.includes('make') &&
        !normalized.includes('add') &&
        text.length < 100
      ) {
        setSlot(slots, 'task_title', text.trim());
      }
    }

    // Fill description if needed (for create_task)
    if (intent === 'create_task' && !isSlotFilled(slots, 'task_description')) {
      // If title is filled and this is a longer text, use as description
      if (isSlotFilled(slots, 'task_title') && text.length > 20) {
        setSlot(slots, 'task_description', text.trim());
      }
    }

    // Fill category if needed (for create_task)
    if (intent === 'create_task' && !isSlotFilled(slots, 'task_category')) {
      // Try to extract category from text (simple heuristic)
      const categoryKeywords = ['maintenance', 'repair', 'safety', 'infrastructure', 'community', 'environment'];
      for (const keyword of categoryKeywords) {
        if (text.toLowerCase().includes(keyword)) {
          setSlot(slots, 'task_category', keyword.charAt(0).toUpperCase() + keyword.slice(1));
          break;
        }
      }
    }
  }

  /**
   * Handle action
   */
  async handleAction(action: Action): Promise<void> {
    await this.runner.handleAction(action);
  }

  /**
   * Return to menu (not part of interface but used internally)
   */
  returnToMenu(): void {
    const context = this.runner.getContext();
    context.currentNode = 'menu';
    context.activeIntent = null;
    context.slots = createInitialContext().slots;
    addMessage(context, 'assistant', 'How can I help you?');
  }

  /**
   * Reset conversation
   */
  reset(): void {
    const newContext = createInitialContext();
    resetContext(this.runner.getContext());
    addMessage(this.runner.getContext(), 'assistant', 'Hello! I\'m your Secretary. How can I help you today?');
  }

  /**
   * Get typeahead options
   */
  getTypeaheadOptions(): Array<{ id: string; label: string; data: any }> {
    const vm = this.getViewModel();
    return vm.typeaheadOptions || [];
  }

  /**
   * Get suggestions
   */
  getSuggestions(): string[] {
    const context = this.runner.getContext();
    return context.reportIssueSuggestions || [];
  }

  /**
   * Add event listener
   */
  addListener(listener: FlowEventListener): void {
    const adapter: FlowRunnerListener = (vm: NodeViewModel) => {
      // Convert NodeViewModel to FlowEvent
      const context = this.runner.getContext();
      const event = {
        type: 'node-entered' as const,
        nodeId: context.currentNode,
        timestamp: Date.now(),
      };
      listener(event);
    };
    this.listenerAdapters.set(listener, adapter);
    this.runner.addListener(adapter);
  }

  /**
   * Remove event listener
   */
  removeListener(listener: FlowEventListener): void {
    const adapter = this.listenerAdapters.get(listener);
    if (adapter) {
      this.runner.removeListener(adapter);
      this.listenerAdapters.delete(listener);
    }
  }

  /**
   * Handle geography selection (for compatibility)
   */
  async handleGeographySelection(selection: { id: string; label: string; data: any }): Promise<void> {
    // Determine which action type based on current node
    const context = this.runner.getContext();
    const currentNode = context.currentNode;
    
    let actionType: 'state-selected' | 'location-selected' | 'guided-location-selected' = 'location-selected';
    
    if (currentNode === 'discovery-select-state') {
      actionType = 'state-selected';
    } else if (currentNode === 'guided-report-location') {
      actionType = 'guided-location-selected';
    }
    
    await this.handleAction({
      type: actionType,
      payload: selection,
    });
  }

  /**
   * Handle category suggestion selection (for compatibility)
   */
  async handleCategorySuggestionSelection(suggestion: string): Promise<void> {
    // Use the correct action type for suggestion selection
    await this.handleAction({
      type: 'suggestion-selected',
      payload: { suggestion },
    });
  }
}
