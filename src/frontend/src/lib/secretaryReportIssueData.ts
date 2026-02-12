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
 * Fetches geography details by ID and level using backend geography-by-ID endpoints.
 * Backend methods not yet implemented - returns null.
 */
export async function fetchGeographyDetails(
  actor: backendInterface | null,
  level: USHierarchyLevel,
  id: string
): Promise<GeographyDetails | null> {
  // Backend methods (getStateById, getCountyById, getCityById) not yet implemented
  return null;
}

/**
 * Fetches top 50 issues for a given geography level and ID with friendly fallback messages.
 * Backend method not yet implemented - returns empty result.
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

  // Backend method (getTopIssuesForLocation) not yet implemented
  return {
    success: true,
    issues: [],
    message: uiCopy.secretary.reportIssueNoTopIssues,
  };
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
