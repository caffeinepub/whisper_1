/**
 * Utility for generating and validating Whisper- prefixed instance names.
 * All instances must start with "Whisper-" followed by geography identifiers in Title-Case hyphenated format.
 * Extended to support Secretary's instance availability checking.
 */

import { USHierarchyLevel } from '@/backend';

const WHISPER_PREFIX = 'Whisper-';

/**
 * Generates a Whisper- prefixed instance name based on geography level.
 * Format examples:
 * - State: "Whisper-California"
 * - County: "Whisper-Los-Angeles-County-California"
 * - Place: "Whisper-Los-Angeles-California"
 */
export function generateWhisperInstanceName(
  level: USHierarchyLevel,
  stateName: string,
  countyName?: string,
  placeName?: string
): string {
  const normalizedState = stateName.trim().replace(/\s+/g, '-');
  
  switch (level) {
    case USHierarchyLevel.place:
      if (!placeName) {
        throw new Error('Place name required for place-level instance');
      }
      const normalizedPlace = placeName.trim().replace(/\s+/g, '-');
      return `${WHISPER_PREFIX}${normalizedPlace}-${normalizedState}`;
    
    case USHierarchyLevel.county:
      if (!countyName) {
        throw new Error('County name required for county-level instance');
      }
      const normalizedCounty = countyName.trim().replace(/\s+/g, '-');
      return `${WHISPER_PREFIX}${normalizedCounty}-${normalizedState}`;
    
    case USHierarchyLevel.state:
      return `${WHISPER_PREFIX}${normalizedState}`;
    
    default:
      throw new Error(`Unsupported geography level: ${level}`);
  }
}

/**
 * Validates that an instance name follows the Whisper- naming convention.
 */
export function isValidWhisperInstanceName(instanceName: string): boolean {
  if (!instanceName || typeof instanceName !== 'string') {
    return false;
  }
  
  return instanceName.startsWith(WHISPER_PREFIX) && instanceName.length > WHISPER_PREFIX.length;
}

/**
 * Normalizes an instance name to ensure consistent formatting.
 */
export function normalizeWhisperInstanceName(instanceName: string): string {
  return instanceName.trim();
}

/**
 * Extracts the geography portion from a Whisper- instance name.
 */
export function extractGeographyFromWhisperName(instanceName: string): string | null {
  if (!isValidWhisperInstanceName(instanceName)) {
    return null;
  }
  
  return instanceName.slice(WHISPER_PREFIX.length);
}

/**
 * Computes the canonical instance name for a given geography selection.
 * Used by Secretary to determine which instance to check/create.
 */
export function computeCanonicalInstanceName(
  state: { longName: string } | null,
  county: { fullName: string } | null,
  place: { shortName: string } | null
): string | null {
  if (!state) return null;

  // Most specific level takes precedence
  if (place) {
    return generateWhisperInstanceName(USHierarchyLevel.place, state.longName, undefined, place.shortName);
  } else if (county) {
    return generateWhisperInstanceName(USHierarchyLevel.county, state.longName, county.fullName);
  } else {
    return generateWhisperInstanceName(USHierarchyLevel.state, state.longName);
  }
}
