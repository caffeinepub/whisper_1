/**
 * Default in-frontend SecretaryBrain implementation using the flow engine.
 * Includes hook points for observing flow events and injecting future actions/destinations.
 * Now integrates intent/slot mini-flow engine with geography NLP, top-issues support, and tracing.
 * Extended with auto-prefill for issue_description, category suggestions, and robust geography typeahead selection.
 */

import type { SecretaryBrain, NavigationHandler } from './SecretaryBrain';
import type { NodeViewModel, Action, FlowEventListener, SecretaryContext } from '../flow/types';
import { FlowRunner, type FlowRunnerListener } from '../flow/runner';
import { createInitialContext, addMessage, resetContext, resetSlotWithDependents } from '../state/secretaryContext';
import { parseDeepLink } from '@/lib/secretaryNavigation';
import type { backendInterface, USState, USCounty, USPlace } from '@/backend';
import { USHierarchyLevel } from '@/backend';
import { determineGeographyFromDiscovery } from '../decisions/secretaryDecisions';
import {
  classifyIntent,
  initializeFlowRegistry,
  getNextMissingSlot,
  areAllRequiredSlotsFilled,
  getSlotPrompt,
  fillSlot,
  executeCompletion,
  looksLikeRepair,
  parseRepairSlot,
  applyRepair,
  lookupUSGeographyFromText,
} from '../intent';
import { extractGeographyFromText } from '../intent/geographyNlp';
import { extractIssueDescription } from '../intent/issueDescriptionNlp';
import { createSecretaryTopIssuesMessaging } from '@/lib/secretaryTopIssuesMessaging';
import { trace } from '../observability/secretaryTrace';
import { clearDependentSlots, isSlotFilled } from '../intent/slotState';

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

  constructor(actor: backendInterface | null) {
    const context = createInitialContext();
    this.runner = new FlowRunner(actor, context);
    
    // Add initial menu greeting to message history
    addMessage(context, 'assistant', 'Hello! I\'m your Secretary. How can I help you today?');
  }

  /**
   * Set navigation handler for external routing
   */
  setNavigationHandler(handler: NavigationHandler): void {
    this.navigationHandler = handler;
    // Initialize flow registry with navigation handler
    initializeFlowRegistry(handler);
  }

  /**
   * Set keyword finder for free-text navigation
   */
  setKeywordFinder(finder: (text: string) => { id: string } | null): void {
    this.findByKeyword = finder;
  }

  /**
   * Update geography data for typeahead
   */
  setGeographyData(
    states: USState[],
    counties: USCounty[],
    places: USPlace[]
  ): void {
    this.allStates = states;
    this.countiesForState = counties;
    this.placesForState = places;
  }

  /**
   * Update complaint suggestions
   */
  setComplaintSuggestions(suggestions: string[]): void {
    this.complaintSuggestions = suggestions;
  }

  /**
   * Update actor reference
   */
  setActor(actor: backendInterface | null): void {
    this.runner.setActor(actor);
  }

  /**
   * Get current context (for external inspection)
   */
  getContext(): SecretaryContext {
    return this.runner.getContext();
  }

  /**
   * Get all messages for display
   */
  getMessages(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return this.runner.getContext().messages;
  }

  /**
   * Check if currently showing menu
   */
  isShowingMenu(): boolean {
    return this.runner.getContext().currentNode === 'menu';
  }

  /**
   * Register a flow event listener (adapts FlowEventListener to FlowRunnerListener)
   */
  addListener(listener: FlowEventListener): void {
    // Create an adapter that converts NodeViewModel to FlowEvent
    const adapter: FlowRunnerListener = (viewModel: NodeViewModel) => {
      const event = {
        type: 'node-entered' as const,
        nodeId: this.runner.getContext().currentNode,
        timestamp: Date.now(),
      };
      listener(event);
    };
    
    // Store the adapter so we can remove it later
    this.listenerAdapters.set(listener, adapter);
    this.runner.addListener(adapter);
  }

  /**
   * Remove a flow event listener
   */
  removeListener(listener: FlowEventListener): void {
    const adapter = this.listenerAdapters.get(listener);
    if (adapter) {
      this.runner.removeListener(adapter);
      this.listenerAdapters.delete(listener);
    }
  }

  /**
   * Get available typeahead options (if applicable)
   */
  getTypeaheadOptions(): Array<{ id: string; label: string; data: any }> {
    const context = this.runner.getContext();
    const nextSlot = context.activeIntent ? getNextMissingSlot(context.activeIntent, context.slots) : null;
    
    if (nextSlot === 'state') {
      return this.allStates.map(state => ({
        id: state.hierarchicalId,
        label: state.longName,
        data: state,
      }));
    } else if (nextSlot === 'county' || nextSlot === 'place') {
      const combined = [...this.countiesForState, ...this.placesForState];
      return combined.map(loc => ({
        id: loc.hierarchicalId,
        label: loc.fullName,
        data: loc,
      }));
    }
    
    return [];
  }

  /**
   * Get available suggestions (if applicable)
   */
  getSuggestions(): string[] {
    const context = this.runner.getContext();
    const nextSlot = context.activeIntent ? getNextMissingSlot(context.activeIntent, context.slots) : null;
    
    if (nextSlot === 'issue_category') {
      return this.complaintSuggestions;
    }
    
    return [];
  }

  /**
   * Get current view model for rendering
   */
  getViewModel(): NodeViewModel {
    const baseViewModel = this.runner.getViewModel();
    const context = this.runner.getContext();
    
    // Enhance view model with typeahead options when in intent-slot filling mode
    if (context.activeIntent && context.currentNode === 'intent-slot-filling') {
      const nextSlot = getNextMissingSlot(context.activeIntent, context.slots);
      
      if (nextSlot === 'state' || nextSlot === 'county' || nextSlot === 'place') {
        const options = this.getTypeaheadOptions();
        return {
          ...baseViewModel,
          showTypeahead: options.length > 0,
          typeaheadOptions: options,
          typeaheadPlaceholder: nextSlot === 'state' 
            ? 'Type to search states...' 
            : 'Type to search counties or cities...',
        };
      }
    }
    
    return baseViewModel;
  }

  reset(): void {
    const context = this.runner.getContext();
    resetContext(context);
    // Re-add initial greeting
    addMessage(context, 'assistant', 'Hello! I\'m your Secretary. How can I help you today?');
  }

  async handleUserText(text: string): Promise<void> {
    const context = this.runner.getContext();
    const currentNode = context.currentNode;

    // Add user message
    addMessage(context, 'user', text);

    // Check if we're in intent/slot filling mode
    if (context.activeIntent && currentNode === 'intent-slot-filling') {
      await this.handleIntentSlotInput(text);
      return;
    }

    // Handle based on current node
    switch (currentNode) {
      case 'menu':
        // Try intent classification first
        const intent = classifyIntent(text);
        if (intent) {
          trace('intent-recognized', { intent, text });
          context.activeIntent = intent;
          context.currentNode = 'intent-slot-filling';
          
          // Try to prefill geography from text using actor-backed lookup
          await this.prefillGeographyFromText(text);
          
          // For report_issue intent, also prefill issue_description
          if (intent === 'report_issue') {
            await this.prefillIssueDescription(text);
          }
          
          await this.continueIntentSlotFilling();
          return;
        }

        // Try deep link parsing
        const deepLink = parseDeepLink(text);
        if (deepLink && this.navigationHandler) {
          this.navigationHandler({ destinationId: deepLink.id, shouldClose: true });
          return;
        }

        // Try keyword matching
        if (this.findByKeyword) {
          const match = this.findByKeyword(text);
          if (match && this.navigationHandler) {
            this.navigationHandler({ destinationId: match.id, shouldClose: true });
            return;
          }
        }

        // Unknown input - use English recovery message
        addMessage(context, 'assistant', 'I didn\'t quite understand that. Could you try rephrasing, or use one of the menu options?');
        break;

      case 'report-collect-description':
        context.reportIssueDescription = text;
        
        // Compute suggestions based on description and geography level
        if (context.reportIssueGeographyLevel) {
          const suggestions = await this.runner.computeComplaintSuggestions(
            context.reportIssueGeographyLevel,
            text
          );
          context.reportIssueSuggestions = suggestions;
          
          // If no suggestions, go directly to custom category
          if (suggestions.length === 0) {
            await this.runner.handleAction({ type: 'something-else' });
            return;
          }
        }
        
        await this.runner.handleAction({ type: 'description-submitted', payload: text });
        break;

      case 'report-custom-category':
        await this.handleCategorySelection(text);
        break;

      case 'unknown-input-recovery':
        // Try again with deep link or keyword
        const retryDeepLink = parseDeepLink(text);
        if (retryDeepLink && this.navigationHandler) {
          this.navigationHandler({ destinationId: retryDeepLink.id, shouldClose: true });
          return;
        }

        if (this.findByKeyword) {
          const retryMatch = this.findByKeyword(text);
          if (retryMatch && this.navigationHandler) {
            this.navigationHandler({ destinationId: retryMatch.id, shouldClose: true });
            return;
          }
        }

        // Still unknown - provide English recovery message
        addMessage(context, 'assistant', 'I still couldn\'t understand that. Please try the menu options or use the Back to Menu button.');
        break;

      default:
        console.warn(`Unhandled text input in node: ${currentNode}`);
    }
  }

  /**
   * Attempt to prefill geography slots from free text using actor-backed lookup.
   * Falls back to in-memory extraction if actor is unavailable.
   */
  private async prefillGeographyFromText(text: string): Promise<void> {
    const context = this.runner.getContext();
    const actor = this.runner.getActor();
    
    try {
      // Try actor-backed lookup first
      if (actor) {
        trace('flow-action', { action: 'geography-lookup-start', text, source: 'actor' });
        const lookupResult = await lookupUSGeographyFromText(text, actor);
        
        if (lookupResult.state) {
          fillSlot(context.slots, 'state', lookupResult.state);
          trace('slot-filled', { slot: 'state', value: lookupResult.state.longName, source: 'actor-lookup' });
        }
        
        if (lookupResult.county) {
          fillSlot(context.slots, 'county', lookupResult.county);
          trace('slot-filled', { slot: 'county', value: lookupResult.county.fullName, source: 'actor-lookup' });
        }
        
        if (lookupResult.place) {
          fillSlot(context.slots, 'place', lookupResult.place);
          trace('slot-filled', { slot: 'place', value: lookupResult.place.fullName, source: 'actor-lookup' });
        }
        
        trace('flow-action', { 
          action: 'geography-lookup-complete',
          foundState: !!lookupResult.state,
          foundCounty: !!lookupResult.county,
          foundPlace: !!lookupResult.place,
        });
        return;
      }
    } catch (error) {
      // Log error but don't crash - fall back to in-memory extraction
      console.error('Actor-backed geography lookup failed, falling back to in-memory:', error);
      trace('flow-action', { action: 'geography-lookup-error', error: String(error) });
    }
    
    // Fallback: Use in-memory extraction
    trace('flow-action', { action: 'geography-lookup-start', text, source: 'in-memory' });
    const extracted = extractGeographyFromText(text, this.allStates, this.countiesForState, this.placesForState);
    
    if (extracted.state) {
      fillSlot(context.slots, 'state', extracted.state);
      trace('slot-filled', { slot: 'state', value: extracted.state.longName, source: 'in-memory' });
    }
    
    if (extracted.county) {
      fillSlot(context.slots, 'county', extracted.county);
      trace('slot-filled', { slot: 'county', value: extracted.county.fullName, source: 'in-memory' });
    }
    
    if (extracted.place) {
      fillSlot(context.slots, 'place', extracted.place);
      trace('slot-filled', { slot: 'place', value: extracted.place.fullName, source: 'in-memory' });
    }
  }

  /**
   * Prefill issue_description from user text by removing geography references
   */
  private async prefillIssueDescription(text: string): Promise<void> {
    const context = this.runner.getContext();
    
    const state = context.slots.state || null;
    const county = context.slots.county || null;
    const place = context.slots.place || null;
    
    const description = extractIssueDescription(text, state, county, place);
    
    if (description && description.length >= 3) {
      fillSlot(context.slots, 'issue_description', description);
      trace('slot-filled', { slot: 'issue_description', value: description, source: 'auto-extract' });
    }
  }

  /**
   * Handle input during intent/slot filling mode
   */
  private async handleIntentSlotInput(text: string): Promise<void> {
    const context = this.runner.getContext();
    
    // Check for repair cues
    if (looksLikeRepair(text)) {
      const repairSlot = parseRepairSlot(text);
      if (repairSlot) {
        trace('slot-repaired', { slot: repairSlot, text });
        applyRepair(context.slots, repairSlot, (slot) => clearDependentSlots(context.slots, slot));
        addMessage(context, 'assistant', `Okay, let's update your ${repairSlot}.`);
        await this.continueIntentSlotFilling();
        return;
      }
    }
    
    // Try to fill the next missing slot
    const nextSlot = getNextMissingSlot(context.activeIntent!, context.slots);
    
    if (nextSlot) {
      // For geography slots, try actor-backed lookup
      if (nextSlot === 'state' || nextSlot === 'county' || nextSlot === 'place') {
        await this.prefillGeographyFromText(text);
      } else {
        // For other slots, fill directly from text
        fillSlot(context.slots, nextSlot, text);
        trace('slot-filled', { slot: nextSlot, value: text });
      }
    }
    
    await this.continueIntentSlotFilling();
  }

  /**
   * Continue intent/slot filling flow
   */
  private async continueIntentSlotFilling(): Promise<void> {
    const context = this.runner.getContext();
    
    if (!context.activeIntent) return;
    
    // Check if all required slots are filled
    if (areAllRequiredSlotsFilled(context.activeIntent, context.slots)) {
      trace('intent-completed', { intent: context.activeIntent });
      
      // Execute completion action
      if (this.navigationHandler) {
        executeCompletion(context.activeIntent, context.slots, this.navigationHandler);
      }
      
      // Reset and return to menu
      resetContext(context);
      addMessage(context, 'assistant', 'Done! Anything else I can help with?');
      return;
    }
    
    // Get next missing slot
    const nextSlot = getNextMissingSlot(context.activeIntent, context.slots);
    
    if (nextSlot) {
      // Special handling for issue_category: fetch and show suggestions
      if (nextSlot === 'issue_category' && context.activeIntent === 'report_issue') {
        await this.handleCategorySuggestions();
        return;
      }
      
      // For other slots, show prompt
      const prompt = getSlotPrompt(nextSlot, context);
      addMessage(context, 'assistant', prompt);
      
      // If it's a geography slot and we have options, show typeahead
      if (nextSlot === 'state' || nextSlot === 'county' || nextSlot === 'place') {
        const options = this.getTypeaheadOptions();
        if (options.length === 0) {
          addMessage(context, 'assistant', 'Please select an option from the list.');
        }
      }
    }
  }

  /**
   * Handle category suggestions for report_issue flow
   */
  private async handleCategorySuggestions(): Promise<void> {
    const context = this.runner.getContext();
    const actor = this.runner.getActor();
    
    // Determine geography level from filled slots
    let geographyLevel: USHierarchyLevel | null = null;
    if (context.slots.place) {
      geographyLevel = USHierarchyLevel.place;
    } else if (context.slots.county) {
      geographyLevel = USHierarchyLevel.county;
    } else if (context.slots.state) {
      geographyLevel = USHierarchyLevel.state;
    }
    
    // Fetch suggestions if we have geography and description
    if (geographyLevel && context.slots.issue_description && actor) {
      try {
        const suggestions = await this.runner.computeComplaintSuggestions(
          geographyLevel,
          context.slots.issue_description
        );
        
        if (suggestions.length > 0) {
          this.complaintSuggestions = suggestions;
          addMessage(context, 'assistant', 'Here are some suggested categories for your issue. Click one to select it, or type your own:');
          return;
        }
      } catch (error) {
        console.error('Failed to fetch category suggestions:', error);
      }
    }
    
    // No suggestions available - ask user to type
    addMessage(context, 'assistant', 'Please type a category for your issue:');
  }

  /**
   * Handle category selection (from suggestion click or typed text)
   */
  private async handleCategorySelection(category: string): Promise<void> {
    const context = this.runner.getContext();
    
    // Store the selected category
    context.reportIssueDescription = `${context.reportIssueDescription} [Category: ${category}]`;
    
    await this.runner.handleAction({ type: 'custom-category-submitted', payload: category });
  }

  /**
   * Handle geography typeahead selection
   */
  async handleGeographySelection(selection: { id: string; label: string; data: any }): Promise<void> {
    const context = this.runner.getContext();
    
    if (!context.activeIntent) return;
    
    const nextSlot = getNextMissingSlot(context.activeIntent, context.slots);
    
    if (!nextSlot) return;
    
    // Determine which geography slot to fill based on data type
    if (nextSlot === 'state' && 'fipsCode' in selection.data && 'longName' in selection.data) {
      fillSlot(context.slots, 'state', selection.data as USState);
      trace('slot-filled', { slot: 'state', value: selection.label, source: 'typeahead' });
      
      // Clear dependent slots
      clearDependentSlots(context.slots, 'state');
    } else if ((nextSlot === 'county' || nextSlot === 'place') && 'censusFipsStateCode' in selection.data) {
      // It's a county
      fillSlot(context.slots, 'county', selection.data as USCounty);
      trace('slot-filled', { slot: 'county', value: selection.label, source: 'typeahead' });
      
      // Clear dependent slots
      clearDependentSlots(context.slots, 'county');
    } else if ((nextSlot === 'county' || nextSlot === 'place') && 'censusStateCode' in selection.data) {
      // It's a place
      fillSlot(context.slots, 'place', selection.data as USPlace);
      trace('slot-filled', { slot: 'place', value: selection.label, source: 'typeahead' });
      
      // Clear dependent slots
      clearDependentSlots(context.slots, 'place');
    }
    
    // Continue to next slot
    await this.continueIntentSlotFilling();
  }

  /**
   * Handle category suggestion selection
   */
  async handleCategorySuggestionSelection(category: string): Promise<void> {
    const context = this.runner.getContext();
    
    if (!context.activeIntent || context.activeIntent !== 'report_issue') return;
    
    const nextSlot = getNextMissingSlot(context.activeIntent, context.slots);
    
    if (nextSlot !== 'issue_category') return;
    
    // Fill the category slot
    fillSlot(context.slots, 'issue_category', category);
    trace('slot-filled', { slot: 'issue_category', value: category, source: 'suggestion-click' });
    
    // Continue to next slot or complete
    await this.continueIntentSlotFilling();
  }

  async handleAction(action: Action): Promise<void> {
    await this.runner.handleAction(action);
  }
}
