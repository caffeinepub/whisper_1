/**
 * Data-driven flow definitions for Secretary capabilities.
 * Represents menu, discovery, report issue, and navigation as explicit nodes with transitions.
 */

import type { NodeDefinition, Transition, SecretaryContext, NodeViewModel } from './types';
import { secretaryCopy } from '../copy/secretaryCopy';
import { buildTopIssuesPrompt, buildDiscoveryResultMessage, buildIssuesList } from '../copy/secretaryPrompts';
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
    }),
  },

  'discovery-result': {
    id: 'discovery-result',
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTypeahead: false,
      buttons: [
        {
          label: 'View Top Issues',
          action: { type: 'view-top-issues' },
          variant: 'outline',
        },
        {
          label: 'Report an Issue',
          action: { type: 'report-issue' },
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
    }),
  },

  'discovery-top-issues': {
    id: 'discovery-top-issues',
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTypeahead: false,
      buttons: [
        {
          label: 'Report an Issue',
          action: { type: 'report-issue' },
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
    }),
  },

  'report-loading': {
    id: 'report-loading',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.reportIssueLoadingData);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTypeahead: false,
      buttons: [],
      showTopIssues: false,
      showSuggestions: false,
    }),
  },

  'report-top-issues': {
    id: 'report-top-issues',
    getViewModel: (context) => ({
      assistantMessages: [secretaryCopy.reportIssueTopIssuesPrompt],
      showTextInput: false,
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.reportIssueSomethingElse,
          action: { type: 'something-else' },
          variant: 'outline',
        },
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: true,
      topIssues: context.reportIssueTopIssues,
      showSuggestions: false,
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
      textInputPlaceholder: 'Describe your issue...',
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
    }),
  },

  'report-show-suggestions': {
    id: 'report-show-suggestions',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.reportIssueSuggestionsPrompt);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.reportIssueSomethingElse,
          action: { type: 'something-else' },
          variant: 'outline',
        },
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'ghost',
        },
      ],
      showTopIssues: false,
      showSuggestions: true,
    }),
  },

  'report-custom-category': {
    id: 'report-custom-category',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.reportIssueCustomCategoryPrompt);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: true,
      textInputPlaceholder: 'Enter custom category...',
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
    }),
  },

  'report-complete': {
    id: 'report-complete',
    onEnter: (context) => {
      addMessage(context, 'assistant', secretaryCopy.reportIssueCategorySelected);
      addMessage(context, 'assistant', secretaryCopy.reportIssueNavigating);
    },
    getViewModel: (context) => ({
      assistantMessages: [],
      showTextInput: false,
      showTypeahead: false,
      buttons: [],
      showTopIssues: false,
      showSuggestions: false,
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
      textInputPlaceholder: 'Try rephrasing...',
      showTypeahead: false,
      buttons: [
        {
          label: secretaryCopy.backToMenu,
          action: { type: 'back-to-menu' },
          variant: 'outline',
        },
      ],
      showTopIssues: false,
      showSuggestions: false,
    }),
  },
};

/**
 * Transition definitions for flow navigation
 */
export const transitions: Transition[] = [
  // Menu transitions
  {
    from: 'menu',
    action: 'menu-option',
    to: (context, payload) => {
      switch (payload) {
        case 1:
          return 'discovery-select-state';
        case 2:
          return 'report-loading';
        case 3:
        case 4:
          return 'menu'; // External navigation handled separately
        default:
          return 'menu';
      }
    },
  },

  // Discovery flow transitions
  {
    from: 'discovery-select-state',
    action: 'state-selected',
    to: 'discovery-select-location',
  },
  {
    from: 'discovery-select-location',
    action: 'location-selected',
    to: 'discovery-result',
  },
  {
    from: 'discovery-result',
    action: 'view-top-issues',
    to: 'discovery-top-issues',
  },
  {
    from: 'discovery-result',
    action: 'report-issue',
    to: 'report-loading',
  },
  {
    from: 'discovery-top-issues',
    action: 'report-issue',
    to: 'report-loading',
  },

  // Report issue flow transitions
  {
    from: 'report-loading',
    action: 'top-issue-selected',
    to: 'report-top-issues',
  },
  {
    from: 'report-loading',
    action: 'description-submitted',
    to: 'report-collect-description',
  },
  {
    from: 'report-top-issues',
    action: 'top-issue-selected',
    to: 'report-complete',
  },
  {
    from: 'report-top-issues',
    action: 'something-else',
    to: 'report-custom-category',
  },
  {
    from: 'report-collect-description',
    action: 'description-submitted',
    to: 'report-show-suggestions',
  },
  {
    from: 'report-show-suggestions',
    action: 'suggestion-selected',
    to: 'report-complete',
  },
  {
    from: 'report-show-suggestions',
    action: 'something-else',
    to: 'report-custom-category',
  },
  {
    from: 'report-custom-category',
    action: 'custom-category-submitted',
    to: 'report-complete',
  },

  // Back to menu from any node
  {
    from: 'discovery-select-state',
    action: 'back-to-menu',
    to: 'menu',
  },
  {
    from: 'discovery-select-location',
    action: 'back-to-menu',
    to: 'menu',
  },
  {
    from: 'discovery-result',
    action: 'back-to-menu',
    to: 'menu',
  },
  {
    from: 'discovery-top-issues',
    action: 'back-to-menu',
    to: 'menu',
  },
  {
    from: 'report-top-issues',
    action: 'back-to-menu',
    to: 'menu',
  },
  {
    from: 'report-collect-description',
    action: 'back-to-menu',
    to: 'menu',
  },
  {
    from: 'report-show-suggestions',
    action: 'back-to-menu',
    to: 'menu',
  },
  {
    from: 'report-custom-category',
    action: 'back-to-menu',
    to: 'menu',
  },
  {
    from: 'unknown-input-recovery',
    action: 'back-to-menu',
    to: 'menu',
  },

  // Unknown input recovery
  {
    from: 'menu',
    action: 'free-text-input',
    to: 'unknown-input-recovery',
  },
  {
    from: 'unknown-input-recovery',
    action: 'free-text-input',
    to: 'unknown-input-recovery',
  },
];
