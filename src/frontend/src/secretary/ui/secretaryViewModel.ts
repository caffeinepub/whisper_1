/**
 * UI rendering model produced by the flow runner.
 * Defines what to show in the UI without coupling to React.
 */

import type { NodeViewModel } from '../flow/types';

/**
 * Convert a node view model to UI-specific rendering instructions
 */
export function prepareUIViewModel(viewModel: NodeViewModel): {
  shouldShowTextInput: boolean;
  shouldShowTypeahead: boolean;
  shouldShowTopIssues: boolean;
  shouldShowSuggestions: boolean;
  textInputPlaceholder: string;
  typeaheadPlaceholder: string;
  buttons: NodeViewModel['buttons'];
  topIssues: string[];
  suggestions: string[];
} {
  return {
    shouldShowTextInput: viewModel.showTextInput,
    shouldShowTypeahead: viewModel.showTypeahead,
    shouldShowTopIssues: viewModel.showTopIssues,
    shouldShowSuggestions: viewModel.showSuggestions,
    textInputPlaceholder: viewModel.textInputPlaceholder || '',
    typeaheadPlaceholder: viewModel.typeaheadPlaceholder || '',
    buttons: viewModel.buttons,
    topIssues: viewModel.topIssues || [],
    suggestions: viewModel.suggestions || [],
  };
}

/**
 * Map icon names to Lucide icon components
 */
export function getIconComponent(iconName?: string): string | undefined {
  return iconName;
}
