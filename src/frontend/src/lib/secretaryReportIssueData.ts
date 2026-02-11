import { USHierarchyLevel, type USState, type USCounty, type USPlace } from '@/backend';
import type { backendInterface } from '@/backend';
import { uiCopy } from './uiCopy';

export interface GeographyDetails {
  level: USHierarchyLevel;
  id: string;
  name: string;
  data: USState | USCounty | USPlace;
}

export interface TopIssuesResult {
  success: boolean;
  issues: string[];
  message: string;
  geography?: GeographyDetails;
}

/**
 * Fetches geography details by ID and level using backend geography-by-ID endpoints
 */
export async function fetchGeographyDetails(
  actor: backendInterface | null,
  level: USHierarchyLevel,
  id: string
): Promise<GeographyDetails | null> {
  if (!actor) {
    return null;
  }

  try {
    switch (level) {
      case USHierarchyLevel.state: {
        const state = await actor.getStateById(id);
        if (state) {
          return {
            level,
            id,
            name: state.longName,
            data: state,
          };
        }
        break;
      }
      case USHierarchyLevel.county: {
        const county = await actor.getCountyById(id);
        if (county) {
          return {
            level,
            id,
            name: county.fullName,
            data: county,
          };
        }
        break;
      }
      case USHierarchyLevel.place: {
        const place = await actor.getCityById(id);
        if (place) {
          return {
            level,
            id,
            name: place.fullName,
            data: place,
          };
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error fetching geography details:', error);
  }

  return null;
}

/**
 * Fetches top 50 issues for a given geography level and ID with friendly fallback messages
 */
export async function fetchTopIssuesForReporting(
  actor: backendInterface | null,
  level: USHierarchyLevel,
  id: string | null
): Promise<TopIssuesResult> {
  if (!actor) {
    return {
      success: false,
      issues: [],
      message: uiCopy.secretary.reportIssueTopIssuesError,
    };
  }

  try {
    const allIssues = await actor.getTopIssuesForLocation(level, id);
    
    if (!allIssues || allIssues.length === 0) {
      return {
        success: true,
        issues: [],
        message: uiCopy.secretary.reportIssueNoTopIssues,
      };
    }

    // Return top 50 issues
    const top50 = allIssues.slice(0, 50);
    
    return {
      success: true,
      issues: top50,
      message: uiCopy.secretary.reportIssueTopIssuesPrompt,
    };
  } catch (error) {
    console.error('Error fetching top issues:', error);
    return {
      success: false,
      issues: [],
      message: uiCopy.secretary.reportIssueTopIssuesError,
    };
  }
}

/**
 * Combined fetch for geography + top issues with proper error handling
 */
export async function fetchReportIssueData(
  actor: backendInterface | null,
  level: USHierarchyLevel,
  id: string
): Promise<{
  geography: GeographyDetails | null;
  topIssues: TopIssuesResult;
}> {
  const geography = await fetchGeographyDetails(actor, level, id);
  const topIssues = await fetchTopIssuesForReporting(actor, level, id);

  return {
    geography,
    topIssues: {
      ...topIssues,
      geography: geography || undefined,
    },
  };
}
