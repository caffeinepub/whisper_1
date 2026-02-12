/**
 * Composable prompt builders for Secretary nodes including slot-filling prompts,
 * category suggestion prompts, repair confirmations, and guided report-issue prompts in English.
 * Extended with task-related slot prompts.
 */

import type { SecretarySlot } from '../intent/types';
import type { GuidedReportDraft } from '../flow/types';
import type { USState, USCounty } from '@/backend';

/**
 * Build a prompt for a missing slot
 */
export function buildSlotPrompt(slot: SecretarySlot, state: USState | null, county: USCounty | null): string {
  switch (slot) {
    case 'state':
      return 'Which state are you interested in?';
    case 'county':
      if (state) {
        return `Which county in ${state.longName}?`;
      }
      return 'Which county?';
    case 'place':
      if (county) {
        return `Which city or place in ${county.shortName}?`;
      } else if (state) {
        return `Which city or place in ${state.longName}?`;
      }
      return 'Which city or place?';
    case 'issue_description':
      return 'Please describe the issue you\'d like to report.';
    case 'issue_category':
      return 'What category best describes this issue?';
    case 'task_title':
      return 'What should I call this task?';
    case 'task_description':
      return 'Can you describe the task in a bit more detail?';
    case 'task_category':
      return 'What category does this task belong to? (You can also skip this by saying "General")';
    case 'task_location_id':
      return 'Which location should this task be associated with? Please tell me the state, county, or city.';
    case 'task_id':
      return 'Which task would you like to update? (Please provide the task ID)';
    case 'task_status':
      return 'What status should I set for this task? (open, in_progress, blocked, or resolved)';
    default:
      return 'Please provide more information.';
  }
}

/**
 * Build a prompt for top issues at a location
 */
export function buildTopIssuesPrompt(locationName: string, issues: string[]): string {
  if (issues.length === 0) {
    return `No top issues are currently tracked for ${locationName}.`;
  }
  return `Here are the top issues in ${locationName}:\n${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}`;
}

/**
 * Build a prompt for discovery result
 */
export function buildDiscoveryResultPrompt(locationName: string): string {
  return `Great! I found information about ${locationName}.`;
}

/**
 * Build a prompt for category suggestions (with suggestions)
 */
export function buildCategorySuggestionsPrompt(suggestions: string[]): string {
  if (suggestions.length === 0) {
    return 'Please enter a category for your issue.';
  }
  return 'Here are some suggested categories based on your description. Choose one or enter a custom category:';
}

/**
 * Build a prompt for category suggestions (no suggestions)
 */
export function buildNoCategorySuggestionsPrompt(): string {
  return 'Please enter a category for your issue.';
}

/**
 * Build a repair confirmation prompt
 */
export function buildRepairConfirmationPrompt(slot: SecretarySlot, newValue: string): string {
  return `Got it, I've updated the ${slot} to "${newValue}".`;
}

/**
 * Build a guided report confirmation summary
 */
export function buildGuidedReportConfirmationSummary(draft: GuidedReportDraft): string {
  const locationParts: string[] = [];
  if (draft.location.place) {
    locationParts.push(draft.location.place.shortName);
  }
  if (draft.location.county) {
    locationParts.push(draft.location.county.shortName);
  }
  if (draft.location.state) {
    locationParts.push(draft.location.state.shortName);
  }
  const locationStr = locationParts.join(', ') || 'Not specified';

  return `**Location:** ${locationStr}\n**Category:** ${draft.category || 'Not specified'}\n**Details:** ${draft.details || 'Not specified'}`;
}
