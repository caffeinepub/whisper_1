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
import { setSlot, isSlotFilled, clearDependentSlots } from '../intent/slotState';
import { executeTaskIntent } from '../intent/taskExecutor';
import { parseTaskTitleFromText, parseTaskDescriptionFromText, parseTaskCategoryFromText, parseTaskId, parseTaskStatus, parseLocationId } from '../intent/taskSlotParsing';
import { lookupUSGeographyFromText, resolveLocationIdFromSlots } from '../intent/geographyLookup';
import { looksLikeRepair, parseRepairSlotForTask } from '../intent/repair';

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
    const activeIntent = context.activeIntent;
    
    // Build typeahead options based on current node or active intent
    let typeaheadOptions: Array<{ id: string; label: string; data: any }> = [];
    
    // Check if we're in task_location_id slot filling
    if (activeIntent === 'create_task' || activeIntent === 'find_tasks' || activeIntent === 'update_task') {
      const nextSlot = getNextMissingSlot(activeIntent, context.slots);
      if (nextSlot === 'task_location_id') {
        // Show states initially
        if (!context.slots.state) {
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
    } else if (currentNode === 'discovery-select-state') {
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

    // Check for repair/correction
    if (looksLikeRepair(text)) {
      const repairSlot = parseRepairSlotForTask(text, intent);
      if (repairSlot) {
        // Clear the slot and its dependents
        clearDependentSlots(slots, repairSlot);
        // Try to fill the slot with new value from text
        await this.fillTaskSlotsFromText(text, intent);
        
        // Continue prompting for missing slots
        const nextSlot = getNextMissingSlot(intent, slots);
        if (nextSlot) {
          const prompt = getSlotPrompt(nextSlot, context);
          addMessage(context, 'assistant', prompt);
        }
        return;
      }
    }

    // Try to fill slots from user text
    await this.fillTaskSlotsFromText(text, intent);

    // Check if all required slots are filled
    if (areAllRequiredSlotsFilled(intent, slots)) {
      // Check if actor is available
      if (!this.actor) {
        addMessage(context, 'assistant', 'I need you to sign in before I can create a task. Please log in and try again.');
        // Keep intent and slots for retry
        return;
      }

      // Execute the task intent
      try {
        const resultMessage = await executeTaskIntent(intent, slots, this.actor);
        addMessage(context, 'assistant', resultMessage);

        // Reset intent and slots on success
        context.activeIntent = null;
        context.slots = createInitialContext().slots;
      } catch (error: any) {
        // Keep intent and slots on failure for retry
        const errorMessage = error.message || 'An error occurred';
        addMessage(context, 'assistant', `I encountered an error: ${errorMessage}. You can try again or correct the information.`);
      }
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
      const title = parseTaskTitleFromText(text, slots);
      if (title) {
        setSlot(slots, 'task_title', title);
      }
    }

    // Fill description if needed (for create_task)
    if (intent === 'create_task' && !isSlotFilled(slots, 'task_description')) {
      const description = parseTaskDescriptionFromText(text, slots);
      if (description) {
        setSlot(slots, 'task_description', description);
      }
    }

    // Fill category if needed (for create_task)
    if (intent === 'create_task' && !isSlotFilled(slots, 'task_category')) {
      const category = parseTaskCategoryFromText(text);
      if (category) {
        setSlot(slots, 'task_category', category);
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
    const context = this.runner.getContext();
    const activeIntent = context.activeIntent;
    
    // If we're in task intent flow and filling task_location_id
    if (activeIntent === 'create_task' || activeIntent === 'find_tasks' || activeIntent === 'update_task') {
      const nextSlot = getNextMissingSlot(activeIntent, context.slots);
      if (nextSlot === 'task_location_id') {
        // Store the geography data
        if (selection.data.fipsCode) {
          // It's a state
          setSlot(context.slots, 'state', selection.data);
        } else if (selection.data.censusFipsStateCode) {
          // It's a county
          setSlot(context.slots, 'county', selection.data);
        } else if (selection.data.censusStateCode) {
          // It's a place
          setSlot(context.slots, 'place', selection.data);
        }
        
        // Set the location ID
        setSlot(context.slots, 'task_location_id', selection.id);
        
        // Continue slot filling
        await this.handleTaskIntentSlotFilling('', activeIntent);
        return;
      }
    }
    
    // Determine which action type based on current node
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
