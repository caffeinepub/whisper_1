/**
 * Small, deterministic helper to derive an initial issue_description from a single free-text message
 * given any extracted state/county/place (e.g., strip matched geography tokens and common connectors
 * like "in/near/at", fallback to original text if stripping is unreliable).
 */

import type { USState, USCounty, USPlace } from '@/backend';

/**
 * Normalize text for matching (lowercase, trim)
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

/**
 * Extract issue description from user text by removing geography references
 */
export function extractIssueDescription(
  text: string,
  state: USState | null,
  county: USCounty | null,
  place: USPlace | null
): string {
  let cleaned = text;
  
  // Remove place name if found
  if (place) {
    const placePattern = new RegExp(place.fullName, 'gi');
    cleaned = cleaned.replace(placePattern, '');
    const placeShortPattern = new RegExp(place.shortName, 'gi');
    cleaned = cleaned.replace(placeShortPattern, '');
  }
  
  // Remove county name if found
  if (county) {
    const countyPattern = new RegExp(county.fullName, 'gi');
    cleaned = cleaned.replace(countyPattern, '');
    const countyShortPattern = new RegExp(county.shortName, 'gi');
    cleaned = cleaned.replace(countyShortPattern, '');
  }
  
  // Remove state name if found
  if (state) {
    const statePattern = new RegExp(state.longName, 'gi');
    cleaned = cleaned.replace(statePattern, '');
    const stateShortPattern = new RegExp(`\\b${state.shortName}\\b`, 'gi');
    cleaned = cleaned.replace(stateShortPattern, '');
  }
  
  // Remove common location connectors
  const connectors = ['in', 'at', 'near', 'around', 'by', 'on', 'off', 'from'];
  for (const connector of connectors) {
    const pattern = new RegExp(`\\b${connector}\\b`, 'gi');
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Clean up extra whitespace and punctuation
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/^[,.\s]+|[,.\s]+$/g, '');
  
  // If cleaning removed too much (less than 3 chars), return original
  if (cleaned.length < 3) {
    return text;
  }
  
  return cleaned;
}
