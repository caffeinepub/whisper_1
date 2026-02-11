/**
 * Pure decision functions for Secretary flow branching.
 * Given context + input/event, return next node/action.
 * Unit-testable without rendering React components.
 */

import type { SecretaryContext, NodeId, Action } from '../flow/types';
import { USHierarchyLevel } from '@/backend';

/**
 * Decide next node after report issue data is loaded
 */
export function decideReportIssueNextNode(context: SecretaryContext): NodeId {
  // If we have top issues, show them
  if (context.reportIssueTopIssues.length > 0) {
    return 'report-top-issues';
  }
  
  // Otherwise, collect description
  return 'report-collect-description';
}

/**
 * Decide if we should show suggestions or go to custom category
 */
export function decideSuggestionsOrCustom(
  context: SecretaryContext,
  suggestions: string[]
): NodeId {
  // If we have suggestions, show them
  if (suggestions.length > 0) {
    return 'report-show-suggestions';
  }
  
  // Otherwise, go straight to custom category
  return 'report-custom-category';
}

/**
 * Handle unknown free-text input and decide recovery path
 */
export function handleUnknownInput(
  context: SecretaryContext,
  input: string
): { nextNode: NodeId; shouldAddRecoveryMessage: boolean } {
  // Store the input for potential retry
  context.lastUserInput = input;
  
  // Always offer recovery with return-to-menu option
  return {
    nextNode: 'unknown-input-recovery',
    shouldAddRecoveryMessage: true,
  };
}

/**
 * Determine geography level and ID from discovery state
 */
export function determineGeographyFromDiscovery(context: SecretaryContext): {
  level: USHierarchyLevel | null;
  id: string | null;
} {
  if (context.selectedPlace) {
    return {
      level: USHierarchyLevel.place,
      id: context.selectedPlace.hierarchicalId,
    };
  }
  
  if (context.selectedCounty) {
    return {
      level: USHierarchyLevel.county,
      id: context.selectedCounty.hierarchicalId,
    };
  }
  
  if (context.selectedState) {
    return {
      level: USHierarchyLevel.state,
      id: context.selectedState.hierarchicalId,
    };
  }
  
  return { level: null, id: null };
}

/**
 * Check if a location has an existing instance
 */
export function checkLocationHasInstance(
  context: SecretaryContext,
  allProposals: Array<[string, any]>
): boolean {
  const { selectedState, selectedCounty, selectedPlace } = context;
  
  if (selectedPlace) {
    return allProposals.some(
      ([_, p]) =>
        p.geographyLevel === USHierarchyLevel.place &&
        p.county === selectedPlace.fullName
    );
  }
  
  if (selectedCounty) {
    return allProposals.some(
      ([_, p]) =>
        p.geographyLevel === USHierarchyLevel.county &&
        p.county === selectedCounty.fullName
    );
  }
  
  if (selectedState) {
    return allProposals.some(
      ([_, p]) =>
        p.geographyLevel === USHierarchyLevel.state &&
        p.state === selectedState.longName
    );
  }
  
  return false;
}

/**
 * Validate if we can proceed with report issue flow
 */
export function canProceedWithReportIssue(context: SecretaryContext): boolean {
  // We can proceed if we have at least a description or a geography context
  return (
    context.reportIssueDescription.trim().length > 0 ||
    context.reportIssueGeographyLevel !== null
  );
}
