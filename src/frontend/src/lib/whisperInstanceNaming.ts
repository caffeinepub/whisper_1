/**
 * Utility for generating and validating WHISPER- prefixed instance names.
 * All instances must start with "WHISPER-" followed by geography identifiers.
 */

import { USHierarchyLevel } from '@/backend';

const WHISPER_PREFIX = 'WHISPER-';

/**
 * Generates a WHISPER- prefixed instance name based on geography level.
 * Format examples:
 * - State: "WHISPER-California"
 * - County: "WHISPER-Los Angeles County,California"
 * - Place: "WHISPER-Los Angeles,California"
 */
export function generateWhisperInstanceName(
  level: USHierarchyLevel,
  stateName: string,
  countyName?: string,
  placeName?: string
): string {
  const normalizedState = stateName.trim();
  
  switch (level) {
    case USHierarchyLevel.place:
      if (!placeName) {
        throw new Error('Place name required for place-level instance');
      }
      return `${WHISPER_PREFIX}${placeName.trim()},${normalizedState}`;
    
    case USHierarchyLevel.county:
      if (!countyName) {
        throw new Error('County name required for county-level instance');
      }
      return `${WHISPER_PREFIX}${countyName.trim()},${normalizedState}`;
    
    case USHierarchyLevel.state:
      return `${WHISPER_PREFIX}${normalizedState}`;
    
    default:
      throw new Error(`Unsupported geography level: ${level}`);
  }
}

/**
 * Validates that an instance name follows the WHISPER- naming convention.
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
 * Extracts the geography portion from a WHISPER- instance name.
 */
export function extractGeographyFromWhisperName(instanceName: string): string | null {
  if (!isValidWhisperInstanceName(instanceName)) {
    return null;
  }
  
  return instanceName.slice(WHISPER_PREFIX.length);
}
