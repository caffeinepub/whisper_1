/**
 * Data-driven flow definitions for Secretary capabilities.
 * Represents menu, discovery, report issue, and navigation as explicit nodes with transitions.
 * Extended with guided report-issue flow (title → location → category → details → confirmation) with textarea support for multi-line issue description.
 */

import type { NodeDefinition, Transition, SecretaryContext, NodeViewModel } from './types';
import { secretaryCopy } from '../copy/secretaryCopy';
import { buildTopIssuesPrompt, buildDiscoveryResultPrompt, buildGuidedReportConfirmationSummary } from '../copy/secretaryPrompts';
import { addMessage } from '../state/secretaryContext';

/**
 * Node definitions for all Secretary flows
 */
export const nodeDefinitions: Record<string, NodeDefinition> = {
  menu: {
    id: 'menu',
    onEnter: (context) => {
      // Clear messages when returning to menu
      if (context.messages.length > 0) {
        context.messages = [];
      }
    },
    getViewModel: (context) => ({
      assistantMessages: [secretaryCopy.menuGreeting],
      showTextInput: true,
      textInputPlaceholder: 'Type a command or ask a question...',
      showTextarea: false,
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.menuOptions.discovery,
          action: { type: 'menu-option', payload: 1 },
          variant: 'outline',
          icon: 'MapPin',
        },
        {
          label: secretaryCopy.menuOptions.reportIssue,
          action: { type: 'menu-option', payload: 2 },
          variant: 'outline',
          icon: 'AlertTriangle',
        },
        {
          label: secretaryCopy.menuOptions.viewProposals,
          action: { type: 'menu-option', payload: 3 },
          variant: 'outline',
          icon: 'FileText',
        },
        {
          label: secretaryCopy.menuOptions.createInstance,
          action: { type: 'menu-option', payload: 4 },
          variant: 'outline',
          icon: 'Plus',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'discovery-select-state': {
    id: 'discovery-select-state',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.discoveryPromptState);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTextarea: false,
      showTypeahead: true,
      typeaheadPlaceholder: 'Type to search states...',
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'discovery-select-location': {
    id: 'discovery-select-location',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.discoveryPromptLocation);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTextarea: false,
      showTypeahead: true,
      typeaheadPlaceholder: 'Type to search counties or cities...',
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'discovery-result': {
    id: 'discovery-result',
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTextarea: false,
      showTypeahead: false,
      buttons: [
        {
          label: 'View Top Issues',
          action: { type: 'view-top-issues' },
          variant: 'default',
        },
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'discovery-top-issues': {
    id: 'discovery-top-issues',
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTextarea: false,
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: true,
      topIssues: context.reportIssueTopIssues,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'report-loading': {
    id: 'report-loading',
    getViewModel: (context) => ({
      assistantMessages: [secretaryCopy.reportIssueLoadingData],
      showTextInput: false,
      showTextarea: false,
      showTypeahead: false,
      buttons: [],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'report-top-issues': {
    id: 'report-top-issues',
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTextarea: false,
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: true,
      topIssues: context.reportIssueTopIssues,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'report-collect-description': {
    id: 'report-collect-description',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.reportIssueDescriptionPrompt);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: true,
      textInputPlaceholder: 'Describe the issue...',
      showTextarea: false,
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'report-show-suggestions': {
    id: 'report-show-suggestions',
    getViewModel: (context) => {
      const hasSuggestions = context.reportIssueSuggestions && context.reportIssueSuggestions.length > 0;
      
      return {
        assistantMessages: hasSuggestions 
          ? ['Here are some suggested categories based on your description:']
          : [],
        showTextInput: false,
        showTextarea: false,
        showTypeahead: false,
        buttons: hasSuggestions
          ? [
              {
                label: 'Something else',
                action: { type: 'something-else' },
                variant: 'outline',
              },
              {
                label: secretaryCopy.backToMenu,
                action: { type: 'back-to-menu' },
                variant: 'ghost',
              },
            ]
          : [
              {
                label: secretaryCopy.backToMenu,
                action: { type: 'back-to-menu' },
                variant: 'ghost',
              },
            ],
        showTopIssues: false,
        showSuggestions: hasSuggestions,
        suggestions: context.reportIssueSuggestions || [],
        showConfirmationSummary: false,
      };
    },
  },

  'report-custom-category': {
    id: 'report-custom-category',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.reportIssueCustomCategoryPrompt);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: true,
      textInputPlaceholder: 'Enter a custom category...',
      showTextarea: false,
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'report-complete': {
    id: 'report-complete',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.reportIssueCategorySelected);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTextarea: false,
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'default',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'unknown-input-recovery': {
    id: 'unknown-input-recovery',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.unknownInputRecovery);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: true,
      textInputPlaceholder: 'Type a command or ask a question...',
      showTextarea: false,
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'intent-slot-filling': {
    id: 'intent-slot-filling',
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: true,
      textInputPlaceholder: 'Type your response...',
      showTextarea: false,
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  // =================== Guided Report-Issue Flow Nodes ===================

  'guided-report-title': {
    id: 'guided-report-title',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.guidedReportTitlePrompt);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: true,
      textInputPlaceholder: 'Enter a short title for the issue...',
      showTextarea: false,
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'guided-report-location': {
    id: 'guided-report-location',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.guidedReportLocationPrompt);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTextarea: false,
      showTypeahead: true,
      typeaheadPlaceholder: 'Type to search states, counties, or cities...',
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'guided-report-category': {
    id: 'guided-report-category',
    onEnter: (context) => {
      const hasSuggestions = context.reportIssueSuggestions && context.reportIssueSuggestions.length > 0;
      const prompt = hasSuggestions 
        ? secretaryCopy.guidedReportCategoryPromptWithSuggestions
        : secretaryCopy.guidedReportCategoryPrompt;
      addMessage(context, 'assistant', prompt);
    },
    getViewModel: (context) => {
      const hasSuggestions = context.reportIssueSuggestions && context.reportIssueSuggestions.length > 0;
      
      return {
        assistantMessages: [],
        showTextInput: !hasSuggestions,
        textInputPlaceholder: 'Enter a category...',
        showTextarea: false,
        showTypeahead: false,
        buttons: hasSuggestions
          ? [
              {
                label: secretaryCopy.guidedReportSomethingElse,
                action: { type: 'something-else' },
                variant: 'outline',
              },
              {
                label: secretaryCopy.backToMenu,
                action: { type: 'back-to-menu' },
                variant: 'ghost',
              },
            ]
          : [
              {
                label: secretaryCopy.backToMenu,
                action: { type: 'back-to-menu' },
                variant: 'ghost',
              },
            ],
        showTopIssues: false,
        showSuggestions: hasSuggestions,
        suggestions: context.reportIssueSuggestions || [],
        showConfirmationSummary: false,
      };
    },
  },

  'guided-report-details': {
    id: 'guided-report-details',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.guidedReportDetailsPrompt);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTextarea: true,
      textareaPlaceholder: 'Describe the issue in detail...',
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
      showConfirmationSummary: false,
    }),
  },

  'guided-report-confirmation': {
    id: 'guided-report-confirmation',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.guidedReportConfirmationPrompt);
    },
    getViewModel: (context) => {
      const summary = buildGuidedReportConfirmationSummary(context.guidedReportDraft);
      
      return {
        assistantMessages: [],
        showTextInput: false,
        showTextarea: false,
        showTypeahead: false,
        buttons: [
          {
            label: secretaryCopy.guidedReportConfirm,
            action: { type: 'guided-confirm-submit' },
            variant: 'default',
          },
          {
            label: secretaryCopy.guidedReportEditTitle,
            action: { type: 'guided-edit-title' },
            variant: 'outline',
          },
          {
            label: secretaryCopy.guidedReportEditLocation,
            action: { type: 'guided-edit-location' },
            variant: 'outline',
          },
          {
            label: secretaryCopy.guidedReportEditCategory,
            action: { type: 'guided-edit-category' },
            variant: 'outline',
          },
          {
            label: secretaryCopy.guidedReportEditDetails,
            action: { type: 'guided-edit-details' },
            variant: 'outline',
          },
          {
            label: secretaryCopy.backToMenu,
            action: { type: 'back-to-menu' },
            variant: 'ghost',
          },
        ],
        showTopIssues: false,
        showSuggestions: false,
        showConfirmationSummary: true,
        confirmationSummary: summary,
      };
    },
  },
};

/**
 * Transition definitions for all flows
 */
export const transitions: Transition[] = [
  // Menu transitions
  { from: 'menu', action: 'menu-option', to: (context, payload) => {
    if (payload === 1) return 'discovery-select-state';
    if (payload === 2) return 'guided-report-title'; // Start guided report flow with title
    if (payload === 3) return 'menu'; // View proposals (navigate externally)
    if (payload === 4) return 'menu'; // Create instance (navigate externally)
    return 'menu';
  }},

  // Discovery flow transitions
  { from: 'discovery-select-state', action: 'state-selected', to: 'discovery-select-location' },
  { from: 'discovery-select-location', action: 'location-selected', to: 'discovery-result' },
  { from: 'discovery-result', action: 'view-top-issues', to: 'discovery-top-issues' },

  // Guided report-issue flow transitions
  { from: 'guided-report-title', action: 'guided-title-submitted', to: 'guided-report-location' },
  { from: 'guided-report-location', action: 'guided-location-selected', to: 'guided-report-category' },
  { from: 'guided-report-category', action: 'guided-category-selected', to: 'guided-report-details' },
  { from: 'guided-report-category', action: 'something-else', to: 'guided-report-details' },
  { from: 'guided-report-details', action: 'guided-details-submitted', to: 'guided-report-confirmation' },
  { from: 'guided-report-confirmation', action: 'guided-confirm-submit', to: 'report-complete' },
  { from: 'guided-report-confirmation', action: 'guided-edit-title', to: 'guided-report-title' },
  { from: 'guided-report-confirmation', action: 'guided-edit-location', to: 'guided-report-location' },
  { from: 'guided-report-confirmation', action: 'guided-edit-category', to: 'guided-report-category' },
  { from: 'guided-report-confirmation', action: 'guided-edit-details', to: 'guided-report-details' },

  // Legacy report issue flow transitions
  { from: 'report-loading', action: 'report-issue', to: 'report-top-issues' },
  { from: 'report-top-issues', action: 'top-issue-selected', to: 'report-collect-description' },
  { from: 'report-collect-description', action: 'description-submitted', to: 'report-show-suggestions' },
  { from: 'report-show-suggestions', action: 'suggestion-selected', to: 'report-complete' },
  { from: 'report-show-suggestions', action: 'something-else', to: 'report-custom-category' },
  { from: 'report-custom-category', action: 'custom-category-submitted', to: 'report-complete' },

  // Back to menu from any node
  { from: 'discovery-select-state', action: 'back-to-menu', to: 'menu' },
  { from: 'discovery-select-location', action: 'back-to-menu', to: 'menu' },
  { from: 'discovery-result', action: 'back-to-menu', to: 'menu' },
  { from: 'discovery-top-issues', action: 'back-to-menu', to: 'menu' },
  { from: 'report-loading', action: 'back-to-menu', to: 'menu' },
  { from: 'report-top-issues', action: 'back-to-menu', to: 'menu' },
  { from: 'report-collect-description', action: 'back-to-menu', to: 'menu' },
  { from: 'report-show-suggestions', action: 'back-to-menu', to: 'menu' },
  { from: 'report-custom-category', action: 'back-to-menu', to: 'menu' },
  { from: 'report-complete', action: 'back-to-menu', to: 'menu' },
  { from: 'unknown-input-recovery', action: 'back-to-menu', to: 'menu' },
  { from: 'intent-slot-filling', action: 'back-to-menu', to: 'menu' },
  { from: 'guided-report-title', action: 'back-to-menu', to: 'menu' },
  { from: 'guided-report-location', action: 'back-to-menu', to: 'menu' },
  { from: 'guided-report-category', action: 'back-to-menu', to: 'menu' },
  { from: 'guided-report-details', action: 'back-to-menu', to: 'menu' },
  { from: 'guided-report-confirmation', action: 'back-to-menu', to: 'menu' },

  // Intent recognition from menu
  { from: 'menu', action: 'intent-recognized', to: 'intent-slot-filling' },

  // Free text input handling
  { from: 'menu', action: 'free-text-input', to: 'unknown-input-recovery' },
];
