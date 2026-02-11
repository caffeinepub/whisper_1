/**
 * Default in-frontend SecretaryBrain implementation using the flow engine.
 * Includes hook points for observing flow events and injecting future actions/destinations.
 * Now integrates intent/slot mini-flow engine with geography NLP, top-issues support, and tracing.
 */

import type { SecretaryBrain, NavigationHandler } from './SecretaryBrain';
import type { NodeViewModel, Action, FlowEventListener, SecretaryContext } from '../flow/types';
import { FlowRunner } from '../flow/runner';
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
import { createSecretaryTopIssuesMessaging } from '@/lib/secretaryTopIssuesMessaging';
import { trace } from '../observability/secretaryTrace';

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

  constructor(actor: backendInterface | null) {
    const context = createInitialContext();
    this.runner = new FlowRunner(context, actor);
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

  reset(): void {
    const context = this.runner.getContext();
    resetContext(context);
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

        // Unknown input
        await this.runner.handleAction({ type: 'free-text-input', payload: text });
        break;

      case 'report-collect-description':
        context.reportIssueDescription = text;
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

        // Still unknown
        addMessage(context, 'assistant', 'I still couldn\'t understand that. Please try the menu options.');
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
    const actor = this.runner['actor'];
    
    try {
      // Try actor-backed lookup first (REQ-1)
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
    
    // Fallback: Use in-memory extraction with React Query-populated data
    trace('flow-action', { action: 'geography-lookup-start', text, source: 'in-memory-fallback' });
    const extracted = extractGeographyFromText(
      text,
      this.allStates,
      this.countiesForState,
      this.placesForState
    );
    
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
   * Handle input during intent/slot filling
   */
  private async handleIntentSlotInput(text: string): Promise<void> {
    const context = this.runner.getContext();

    // Check for repair cues
    if (looksLikeRepair(text)) {
      const slotToRepair = parseRepairSlot(text);
      if (slotToRepair) {
        // Clear the slot and dependents
        resetSlotWithDependents(context, slotToRepair);
        trace('slot-repaired', { slot: slotToRepair, dependentsCleared: true });
        addMessage(context, 'assistant', `Okay, let's update your ${slotToRepair}.`);
        await this.continueIntentSlotFilling();
        return;
      }
      
      // Generic repair without specific slot
      addMessage(context, 'assistant', 'What would you like to change? You can say "change state", "change county", etc.');
      return;
    }

    // Get the next missing slot
    const nextSlot = getNextMissingSlot(context.activeIntent, context.slots);
    
    if (nextSlot === 'issue_description') {
      // Fill description slot
      fillSlot(context.slots, 'issue_description', text);
      trace('slot-filled', { slot: 'issue_description', value: text.substring(0, 50) });
      await this.continueIntentSlotFilling();
    } else if (nextSlot === 'issue_category') {
      // Fill category slot
      fillSlot(context.slots, 'issue_category', text);
      trace('slot-filled', { slot: 'issue_category', value: text });
      await this.continueIntentSlotFilling();
    } else {
      // For geography slots, we expect typeahead selection, not free text
      addMessage(context, 'assistant', 'Please select an option from the list.');
    }
  }

  /**
   * Continue intent/slot filling flow
   */
  private async continueIntentSlotFilling(): Promise<void> {
    const context = this.runner.getContext();

    // Check if all required slots are filled
    if (areAllRequiredSlotsFilled(context.activeIntent, context.slots)) {
      // Execute completion
      await this.completeIntentFlow();
      return;
    }

    // Get next missing slot and prompt
    const nextSlot = getNextMissingSlot(context.activeIntent, context.slots);
    if (nextSlot) {
      const prompt = getSlotPrompt(nextSlot, context);
      addMessage(context, 'assistant', prompt);
    }
  }

  /**
   * Complete the intent flow
   */
  private async completeIntentFlow(): Promise<void> {
    const context = this.runner.getContext();
    const actor = this.runner['actor'];

    trace('intent-completed', { intent: context.activeIntent });

    switch (context.activeIntent) {
      case 'report_issue':
        addMessage(context, 'assistant', 'Great! I\'ll help you create an Issue Project for that.');
        // Signal navigation after delay
        setTimeout(() => {
          if (this.navigationHandler) {
            executeCompletion(context.activeIntent, context);
          }
        }, 1000);
        break;

      case 'create_instance':
        addMessage(context, 'assistant', 'Taking you to Create Instance...');
        setTimeout(() => {
          executeCompletion(context.activeIntent, context);
        }, 500);
        break;

      case 'find_instance':
        addMessage(context, 'assistant', 'Let me show you what\'s happening in your area...');
        // Transition to discovery result
        context.selectedState = context.slots.state;
        context.selectedCounty = context.slots.county;
        context.selectedPlace = context.slots.place;
        context.currentNode = 'discovery-result';
        break;

      case 'ask_category':
        // Show categories for the selected geography
        addMessage(context, 'assistant', 'Here are the common issue categories for your area:');
        break;

      case 'top_issues':
        // Fetch and display top issues
        if (!actor) {
          addMessage(context, 'assistant', 'I\'m having trouble connecting to the backend. Please try again.');
          return;
        }
        
        await this.fetchAndDisplayTopIssues(actor);
        break;
    }
  }

  /**
   * Fetch and display top issues for the selected geography
   */
  private async fetchAndDisplayTopIssues(actor: backendInterface): Promise<void> {
    const context = this.runner.getContext();
    const messaging = createSecretaryTopIssuesMessaging(actor);
    
    addMessage(context, 'assistant', 'Let me check the top issues for that location...');
    
    try {
      let result;
      
      // Use most specific geography available
      if (context.slots.place) {
        result = await messaging.getTopIssuesForCity(context.slots.place.hierarchicalId);
      } else if (context.slots.county) {
        result = await messaging.getTopIssuesForCounty(context.slots.county.hierarchicalId);
      } else if (context.slots.state) {
        result = await messaging.getTopIssuesForState(context.slots.state.hierarchicalId);
      } else {
        addMessage(context, 'assistant', 'I need a location to show you the top issues. Please select a state first.');
        return;
      }
      
      // Display result
      addMessage(context, 'assistant', result.message);
      
      if (result.issues.length > 0) {
        const issuesList = result.issues.map((issue, idx) => `${idx + 1}. ${issue}`).join('\n');
        addMessage(context, 'assistant', issuesList);
        
        // Store issues for display
        context.reportIssueTopIssues = result.issues.slice(0, 50);
      } else {
        addMessage(context, 'assistant', 'Would you like to report an issue instead?');
      }
    } catch (error) {
      console.error('Error fetching top issues:', error);
      addMessage(context, 'assistant', 'I\'m having trouble retrieving issues right now. Please try again later.');
    }
  }

  async handleAction(action: Action): Promise<void> {
    const context = this.runner.getContext();

    trace('flow-action', { type: action.type, payload: typeof action.payload });

    // Handle intent/slot filling actions
    if (context.activeIntent && context.currentNode === 'intent-slot-filling') {
      if (action.type === 'state-selected') {
        fillSlot(context.slots, 'state', action.payload);
        trace('slot-filled', { slot: 'state', value: action.payload.longName, source: 'typeahead' });
        addMessage(context, 'user', action.payload.longName);
        await this.continueIntentSlotFilling();
        return;
      } else if (action.type === 'location-selected') {
        if (action.payload.censusFipsStateCode) {
          // County
          fillSlot(context.slots, 'county', action.payload);
          trace('slot-filled', { slot: 'county', value: action.payload.fullName, source: 'typeahead' });
          addMessage(context, 'user', action.payload.fullName);
        } else {
          // Place
          fillSlot(context.slots, 'place', action.payload);
          trace('slot-filled', { slot: 'place', value: action.payload.fullName, source: 'typeahead' });
          addMessage(context, 'user', action.payload.fullName);
        }
        await this.continueIntentSlotFilling();
        return;
      } else if (action.type === 'suggestion-selected') {
        fillSlot(context.slots, 'issue_category', action.payload);
        trace('slot-filled', { slot: 'issue_category', value: action.payload, source: 'suggestion' });
        addMessage(context, 'user', action.payload);
        addMessage(context, 'assistant', `Got it, you selected "${action.payload}".`);
        await this.continueIntentSlotFilling();
        return;
      } else if (action.type === 'back-to-menu') {
        context.activeIntent = null;
        context.currentNode = 'menu';
        context.messages = [];
        addMessage(context, 'assistant', 'Back to the main menu. How can I help you?');
        return;
      }
    }

    // Handle standard flow actions
    await this.runner.handleAction(action);
  }

  async handleCategorySelection(category: string): Promise<void> {
    const context = this.runner.getContext();
    await this.runner.handleAction({ type: 'something-else', payload: category });
  }

  getViewModel(): NodeViewModel {
    return this.runner.getViewModel();
  }

  addListener(listener: FlowEventListener): void {
    this.runner.addListener(listener);
  }

  removeListener(listener: FlowEventListener): void {
    this.runner.removeListener(listener);
  }
}
