import type { USState, USCounty, USPlace, USHierarchyLevel } from '@/backend';
import type { backendInterface } from '@/backend';
import { USHierarchyLevel as HierarchyLevel } from '@/backend';

interface TopIssuesResult {
  message: string;
  issues: string[];
}

/**
 * Helper module for Secretary to retrieve and format top issues for locations.
 * Calls backend geography-by-ID and top-issues endpoints, then formats results
 * into friendly English messages with robust fallbacks for null/empty cases.
 */
export class SecretaryTopIssuesMessaging {
  constructor(private actor: backendInterface) {}

  /**
   * Retrieve and format top issues for a state by ID
   */
  async getTopIssuesForState(stateId: string): Promise<TopIssuesResult> {
    try {
      const state = await this.actor.getStateById(stateId);
      
      if (!state) {
        return {
          message: "I couldn't find that state. Please try again.",
          issues: [],
        };
      }

      const issues = await this.actor.getTopIssuesForLocation(HierarchyLevel.state, stateId);
      
      if (!issues || issues.length === 0) {
        return {
          message: `No common issues have been recorded for ${state.longName} yet. You can still describe your issue and we'll help you get started.`,
          issues: [],
        };
      }

      return {
        message: `Here are the most common issues in ${state.longName}:`,
        issues: issues.slice(0, 50),
      };
    } catch (error) {
      console.error('Error fetching state issues:', error);
      return {
        message: "I'm having trouble retrieving state issues right now. You can still describe your issue below.",
        issues: [],
      };
    }
  }

  /**
   * Retrieve and format top issues for a county by ID
   */
  async getTopIssuesForCounty(countyId: string): Promise<TopIssuesResult> {
    try {
      const county = await this.actor.getCountyById(countyId);
      
      if (!county) {
        return {
          message: "I couldn't find that county. Please try again.",
          issues: [],
        };
      }

      const issues = await this.actor.getTopIssuesForLocation(HierarchyLevel.county, countyId);
      
      if (!issues || issues.length === 0) {
        return {
          message: `No common issues have been recorded for ${county.fullName} yet. You can still describe your issue and we'll help you get started.`,
          issues: [],
        };
      }

      return {
        message: `Here are the most common issues in ${county.fullName}:`,
        issues: issues.slice(0, 50),
      };
    } catch (error) {
      console.error('Error fetching county issues:', error);
      return {
        message: "I'm having trouble retrieving county issues right now. You can still describe your issue below.",
        issues: [],
      };
    }
  }

  /**
   * Retrieve and format top issues for a city/place by ID
   */
  async getTopIssuesForCity(cityId: string): Promise<TopIssuesResult> {
    try {
      const city = await this.actor.getCityById(cityId);
      
      if (!city) {
        return {
          message: "I couldn't find that city. Please try again.",
          issues: [],
        };
      }

      const issues = await this.actor.getTopIssuesForLocation(HierarchyLevel.place, cityId);
      
      if (!issues || issues.length === 0) {
        return {
          message: `No common issues have been recorded for ${city.shortName} yet. You can still describe your issue and we'll help you get started.`,
          issues: [],
        };
      }

      return {
        message: `Here are the most common issues in ${city.shortName}:`,
        issues: issues.slice(0, 50),
      };
    } catch (error) {
      console.error('Error fetching city issues:', error);
      return {
        message: "I'm having trouble retrieving city issues right now. You can still describe your issue below.",
        issues: [],
      };
    }
  }

  /**
   * Retrieve and format general top issues for a given level (no specific location)
   */
  async getGeneralTopIssuesForLevel(level: USHierarchyLevel): Promise<TopIssuesResult> {
    try {
      const issues = await this.actor.getTopIssuesForLocation(level, null);
      
      if (!issues || issues.length === 0) {
        return {
          message: `No common issues have been recorded for ${this.getLevelLabel(level)} level yet. Please describe your issue below.`,
          issues: [],
        };
      }

      const levelLabel = this.getLevelLabel(level);
      return {
        message: `Here are the most common ${levelLabel}-level issues:`,
        issues: issues.slice(0, 50),
      };
    } catch (error) {
      console.error('Error fetching general issues:', error);
      return {
        message: "I'm having trouble retrieving issues right now. You can still describe your issue below.",
        issues: [],
      };
    }
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
