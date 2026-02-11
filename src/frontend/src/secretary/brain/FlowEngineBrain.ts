/**
 * Default in-frontend SecretaryBrain implementation using the flow engine.
 * Includes hook points for observing flow events and injecting future actions/destinations.
 * Now integrates intent/slot mini-flow engine.
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
} from '../intent';

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
          context.activeIntent = intent;
          context.currentNode = 'intent-slot-filling';
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
        addMessage(context, 'assistant', `Okay, let's update your ${slotToRepair}.`);
        await this.continueIntentSlotFilling();
        return;
      }
    }

    // Get the next missing slot
    const nextSlot = getNextMissingSlot(context.activeIntent, context.slots);
    
    if (nextSlot === 'issue_description') {
      // Fill description slot
      fillSlot(context.slots, 'issue_description', text);
      await this.continueIntentSlotFilling();
    } else if (nextSlot === 'issue_category') {
      // Fill category slot
      fillSlot(context.slots, 'issue_category', text);
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
    }
  }

  async handleAction(action: Action): Promise<void> {
    const context = this.runner.getContext();

    // Handle intent/slot filling actions
    if (context.activeIntent && context.currentNode === 'intent-slot-filling') {
      if (action.type === 'state-selected') {
        fillSlot(context.slots, 'state', action.payload);
        addMessage(context, 'user', action.payload.longName);
        await this.continueIntentSlotFilling();
        return;
      } else if (action.type === 'location-selected') {
        if (action.payload.censusFipsStateCode) {
          // County
          fillSlot(context.slots, 'county', action.payload);
          addMessage(context, 'user', action.payload.fullName);
        } else {
          // Place
          fillSlot(context.slots, 'place', action.payload);
          addMessage(context, 'user', action.payload.fullName);
        }
        await this.continueIntentSlotFilling();
        return;
      } else if (action.type === 'suggestion-selected') {
        fillSlot(context.slots, 'issue_category', action.payload);
        addMessage(context, 'user', action.payload);
        await this.continueIntentSlotFilling();
        return;
      } else if (action.type === 'back-to-menu') {
        context.activeIntent = null;
        context.currentNode = 'menu';
        context.messages = [];
        return;
      }
    }

    // Handle special actions
    switch (action.type) {
      case 'menu-option':
        if (action.payload === 3 || action.payload === 4) {
          // External navigation
          const destinationId = action.payload === 3 ? 'proposals' : 'create-instance';
          if (this.navigationHandler) {
            this.navigationHandler({ destinationId, shouldClose: true });
          }
          return;
        }
        break;

      case 'state-selected':
        context.selectedState = action.payload;
        addMessage(context, 'user', action.payload.longName);
        break;

      case 'location-selected':
        if (action.payload.censusFipsStateCode) {
          context.selectedCounty = action.payload;
          addMessage(context, 'user', action.payload.fullName);
        } else {
          context.selectedPlace = action.payload;
          addMessage(context, 'user', action.payload.fullName);
        }
        break;

      case 'report-issue':
        // Set geography from discovery state
        const { level, id } = determineGeographyFromDiscovery(context);
        context.reportIssueGeographyLevel = level;
        context.reportIssueGeographyId = id;
        break;

      case 'top-issue-selected':
        await this.handleCategorySelection(action.payload);
        return;

      case 'suggestion-selected':
        await this.handleCategorySelection(action.payload);
        return;
    }

    // Delegate to runner
    await this.runner.handleAction(action);
  }

  private async handleCategorySelection(category: string): Promise<void> {
    const context = this.runner.getContext();
    addMessage(context, 'user', category);
    
    // Transition to complete
    await this.runner.handleAction({ type: 'custom-category-submitted', payload: category });

    // Signal navigation after a delay
    setTimeout(() => {
      if (this.navigationHandler) {
        // This would trigger the Issue Project creation flow
        // For now, we'll just emit an event
        this.runner['emitEvent']({
          type: 'navigation-requested',
          navigationId: 'issue-project',
          timestamp: Date.now(),
        });
      }
    }, 1000);
  }

  getViewModel(): NodeViewModel {
    const context = this.runner.getContext();

    // If in intent/slot filling mode, generate custom view model
    if (context.activeIntent && context.currentNode === 'intent-slot-filling') {
      return this.getIntentSlotViewModel();
    }

    return this.runner.getViewModel();
  }

  /**
   * Generate view model for intent/slot filling
   */
  private getIntentSlotViewModel(): NodeViewModel {
    const context = this.runner.getContext();
    const nextSlot = getNextMissingSlot(context.activeIntent, context.slots);

    if (!nextSlot) {
      // All slots filled, show completion message
      return {
        assistantMessages: [],
        showTextInput: false,
        showTypeahead: false,
        buttons: [],
        showTopIssues: false,
        showSuggestions: false,
      };
    }

    // Show appropriate input for the next slot
    if (nextSlot === 'state' || nextSlot === 'county' || nextSlot === 'place') {
      return {
        assistantMessages: [],
        showTextInput: false,
        showTypeahead: true,
        typeaheadPlaceholder: `Select ${nextSlot}...`,
        buttons: [],
        showTopIssues: false,
        showSuggestions: false,
      };
    } else if (nextSlot === 'issue_description') {
      return {
        assistantMessages: [],
        showTextInput: true,
        textInputPlaceholder: 'Describe the issue...',
        showTypeahead: false,
        buttons: [],
        showTopIssues: false,
        showSuggestions: false,
      };
    } else if (nextSlot === 'issue_category') {
      return {
        assistantMessages: [],
        showTextInput: false,
        showTypeahead: false,
        buttons: [
          {
            label: 'Something else',
            action: { type: 'something-else' },
            variant: 'outline',
          },
        ],
        showTopIssues: false,
        showSuggestions: true,
      };
    }

    return {
      assistantMessages: [],
      showTextInput: true,
      showTypeahead: false,
      buttons: [],
      showTopIssues: false,
      showSuggestions: false,
    };
  }

  getMessages(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return this.runner.getContext().messages;
  }

  isShowingMenu(): boolean {
    return this.runner.getContext().currentNode === 'menu';
  }

  addListener(listener: FlowEventListener): void {
    this.runner.addListener(listener);
  }

  removeListener(listener: FlowEventListener): void {
    this.runner.removeListener(listener);
  }

  getTypeaheadOptions(): Array<{ id: string; label: string; data: any }> {
    const context = this.runner.getContext();
    const currentNode = context.currentNode;

    // Handle intent/slot filling typeahead
    if (context.activeIntent && currentNode === 'intent-slot-filling') {
      const nextSlot = getNextMissingSlot(context.activeIntent, context.slots);
      
      if (nextSlot === 'state') {
        return this.allStates.map((state) => ({
          id: state.hierarchicalId,
          label: state.longName,
          data: state,
        }));
      } else if (nextSlot === 'county' || nextSlot === 'place') {
        const counties = this.countiesForState.map((county) => ({
          id: county.hierarchicalId,
          label: county.fullName,
          data: county,
        }));
        const places = this.placesForState.map((place) => ({
          id: place.hierarchicalId,
          label: place.fullName,
          data: place,
        }));
        return [...counties, ...places];
      }
    }

    switch (currentNode) {
      case 'discovery-select-state':
        return this.allStates.map((state) => ({
          id: state.hierarchicalId,
          label: state.longName,
          data: state,
        }));

      case 'discovery-select-location':
        const counties = this.countiesForState.map((county) => ({
          id: county.hierarchicalId,
          label: county.fullName,
          data: county,
        }));
        const places = this.placesForState.map((place) => ({
          id: place.hierarchicalId,
          label: place.fullName,
          data: place,
        }));
        return [...counties, ...places];

      default:
        return [];
    }
  }

  getSuggestions(): string[] {
    const context = this.runner.getContext();
    
    // Handle intent/slot filling suggestions
    if (context.activeIntent && context.currentNode === 'intent-slot-filling') {
      const nextSlot = getNextMissingSlot(context.activeIntent, context.slots);
      if (nextSlot === 'issue_category') {
        return this.complaintSuggestions;
      }
    }

    if (context.currentNode === 'report-show-suggestions') {
      return this.complaintSuggestions;
    }
    return [];
  }

  getContext(): SecretaryContext {
    return this.runner.getContext();
  }
}
