/**
 * Composable prompt builders/templates for Secretary nodes.
 * Functions return formatted strings to avoid one-off strings in handlers.
 */

import type { USState, USCounty, USPlace } from '@/backend';

/**
 * Format a location name for display
 */
function formatLocationName(
  state: USState | null,
  county: USCounty | null,
  place: USPlace | null
): string {
  if (place) return place.fullName;
  if (county) return county.fullName;
  if (state) return state.longName;
  return 'this location';
}

/**
 * Build a prompt for top issues with location context
 */
export function buildTopIssuesPrompt(
  locationName: string,
  issuesCount: number
): string {
  if (issuesCount === 0) {
    return `No common issues have been recorded for ${locationName} yet. You can still describe your issue and we'll help you get started.`;
  }
  return `Here are the most common issues in ${locationName}:`;
}

/**
 * Build a discovery result message
 */
export function buildDiscoveryResultMessage(
  state: USState | null,
  county: USCounty | null,
  place: USPlace | null,
  hasInstance: boolean
): string {
  const locationName = formatLocationName(state, county, place);
  
  if (hasInstance) {
    return `Good news! ${locationName} already has an active Whisper instance.`;
  }
  
  return `${locationName} doesn't have a Whisper instance yet. You could be a founding citizen!`;
}

/**
 * Build a list of issues as numbered items
 */
export function buildIssuesList(issues: string[]): string {
  if (issues.length === 0) return '';
  return issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n');
}

/**
 * Build a clarification prompt for unknown input
 */
export function buildUnknownInputPrompt(userInput: string): string {
  return `I'm not sure I understood "${userInput}". Could you rephrase, or would you like to return to the main menu?`;
}

/**
 * Build a slot-filling prompt with context
 */
export function buildSlotPrompt(
  slotName: string,
  state: USState | null,
  county: USCounty | null
): string {
  switch (slotName) {
    case 'state':
      return 'Which state would you like to explore?';
    case 'county':
      if (state) {
        return `Great! Now, which county in ${state.longName} would you like to explore?`;
      }
      return 'Which county would you like to explore?';
    case 'place':
      if (county) {
        return `Which city or town in ${county.fullName}?`;
      }
      if (state) {
        return `Which city or town in ${state.longName}?`;
      }
      return 'Which city or town would you like to explore?';
    case 'issue_description':
      return 'Please describe the issue you\'d like to report:';
    case 'issue_category':
      return 'Based on your description, here are some suggested categories:';
    default:
      return 'Please provide more information:';
  }
}

/**
 * Build a repair confirmation message
 */
export function buildRepairConfirmation(slotName: string, newValue: string): string {
  return `Got it, I've updated your ${slotName} to "${newValue}".`;
}
