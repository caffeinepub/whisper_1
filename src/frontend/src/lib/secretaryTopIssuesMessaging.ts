import type { USState, USCounty, USPlace, USHierarchyLevel } from '@/backend';
import type { backendInterface } from '@/backend';
import { USHierarchyLevel as HierarchyLevel } from '@/backend';

interface TopIssuesResult {
  message: string;
  issues: string[];
}

/**
 * Helper module for Secretary to retrieve and format top issues for locations.
 * Backend methods not yet implemented - returns empty results with friendly messages.
 */
export class SecretaryTopIssuesMessaging {
  constructor(private actor: backendInterface) {}

  /**
   * Retrieve and format top issues for a state by ID.
   * Backend methods not yet implemented - returns empty result.
   */
  async getTopIssuesForState(stateId: string): Promise<TopIssuesResult> {
    // Backend methods (getStateById, getTopIssuesForLocation) not yet implemented
    return {
      message: "Top issues data is not yet available. You can still describe your issue and we'll help you get started.",
      issues: [],
    };
  }

  /**
   * Retrieve and format top issues for a county by ID.
   * Backend methods not yet implemented - returns empty result.
   */
  async getTopIssuesForCounty(countyId: string): Promise<TopIssuesResult> {
    // Backend methods (getCountyById, getTopIssuesForLocation) not yet implemented
    return {
      message: "Top issues data is not yet available. You can still describe your issue and we'll help you get started.",
      issues: [],
    };
  }

  /**
   * Retrieve and format top issues for a city/place by ID.
   * Backend methods not yet implemented - returns empty result.
   */
  async getTopIssuesForCity(cityId: string): Promise<TopIssuesResult> {
    // Backend methods (getCityById, getTopIssuesForLocation) not yet implemented
    return {
      message: "Top issues data is not yet available. You can still describe your issue and we'll help you get started.",
      issues: [],
    };
  }

  /**
   * Retrieve and format general top issues for a given level (no specific location).
   * Backend method not yet implemented - returns empty result.
   */
  async getGeneralTopIssuesForLevel(level: USHierarchyLevel): Promise<TopIssuesResult> {
    // Backend method (getTopIssuesForLocation) not yet implemented
    const levelLabel = this.getLevelLabel(level);
    return {
      message: `Top issues data is not yet available for ${levelLabel} level. Please describe your issue below.`,
      issues: [],
    };
  }

  /**
   * Format a list of issues into a readable bulleted list
   */
  formatIssuesList(issues: string[]): string {
    if (issues.length === 0) {
      return '';
    }
    return issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n');
  }

  /**
   * Get a friendly label for a hierarchy level
   */
  private getLevelLabel(level: USHierarchyLevel): string {
    switch (level) {
      case HierarchyLevel.country:
        return 'national';
      case HierarchyLevel.state:
        return 'state';
      case HierarchyLevel.county:
        return 'county';
      case HierarchyLevel.place:
        return 'city';
      default:
        return 'general';
    }
  }
}

/**
 * Convenience function to create a messaging helper from an actor
 */
export function createSecretaryTopIssuesMessaging(actor: backendInterface): SecretaryTopIssuesMessaging {
  return new SecretaryTopIssuesMessaging(actor);
}
