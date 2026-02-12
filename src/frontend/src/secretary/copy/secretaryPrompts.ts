/**
 * Composable prompt builders/templates for Secretary nodes with formatted strings
 * for top issues, discovery results, issue lists, unknown input, slot-filling prompts,
 * and repair confirmations. Extended with category suggestion prompts.
 */

import type { USState, USCounty, USPlace } from '@/backend';

/**
 * Build a prompt for top issues in a location
 */
export function buildTopIssuesPrompt(locationName: string, issues: string[]): string {
  if (issues.length === 0) {
    return `I couldn't find any top issues for ${locationName} yet. Would you like to report the first one?`;
  }

  const issueList = issues.map((issue, idx) => `${idx + 1}. ${issue}`).join('\n');
  return `Here are the top issues in ${locationName}:\n\n${issueList}\n\nWould you like to report a new issue or view details on one of these?`;
}

/**
 * Build a prompt for discovery results
 */
export function buildDiscoveryResultPrompt(
  state: USState | null,
  county: USCounty | null,
  place: USPlace | null
): string {
  if (place) {
    return `Great! I found ${place.fullName}. What would you like to do?`;
  } else if (county) {
    return `Great! I found ${county.fullName}. What would you like to do?`;
  } else if (state) {
    return `Great! I found ${state.longName}. What would you like to do?`;
  }
  return 'I couldn\'t find that location. Could you try again?';
}

/**
 * Build a prompt for unknown input recovery
 */
export function buildUnknownInputPrompt(): string {
  return 'I didn\'t quite understand that. Could you try rephrasing, or use one of the menu options?';
}

/**
 * Build a slot-filling prompt for a specific slot
 */
export function buildSlotPrompt(
  slot: string,
  currentState: USState | null,
  currentCounty: USCounty | null
): string {
  switch (slot) {
    case 'state':
      return 'Which state is this issue in?';
    case 'county':
      return currentState
        ? `Which county in ${currentState.longName}?`
        : 'Which county is this issue in?';
    case 'place':
      return currentCounty
        ? `Which city or town in ${currentCounty.fullName}?`
        : 'Which city or town is this issue in?';
    case 'issue_description':
      return 'Please describe the issue you\'d like to report:';
    case 'issue_category':
      return 'What category does this issue fall under?';
    case 'instance_name':
      return 'What would you like to name this instance?';
    default:
      return `Please provide: ${slot}`;
  }
}

/**
 * Build a repair confirmation prompt
 */
export function buildRepairConfirmationPrompt(slot: string): string {
  return `Okay, let's update your ${slot}.`;
}

/**
 * Build a category suggestion prompt (with suggestions available)
 */
export function buildCategorySuggestionPrompt(): string {
  return 'Here are some suggested categories for your issue. Click one to select it, or type your own:';
}

/**
 * Build a category prompt (no suggestions available)
 */
export function buildCategoryNoSuggestionsPrompt(): string {
  return 'Please type a category for your issue:';
}
