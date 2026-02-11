/**
 * Small, deterministic helper utilities to match state/county/place names
 * from already-fetched geography lists against user free text.
 * No external services - pure client-side string matching for slot prefilling.
 */

import type { USState, USCounty, USPlace } from '@/backend';

/**
 * Normalize text for matching (lowercase, trim, remove punctuation)
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[.,!?;]/g, '');
}

/**
 * Check if text contains a state name or abbreviation
 * Exported for use by geographyLookup.ts
 */
export function findStateInText(
  text: string,
  states: USState[]
): USState | null {
  const normalized = normalizeText(text);
  
  // Try exact match on long name
  for (const state of states) {
    const stateName = normalizeText(state.longName);
    if (normalized.includes(stateName)) {
      return state;
    }
  }
  
  // Try exact match on short name (abbreviation)
  for (const state of states) {
    const stateAbbr = normalizeText(state.shortName);
    // Match whole word only for abbreviations
    const regex = new RegExp(`\\b${stateAbbr}\\b`, 'i');
    if (regex.test(normalized)) {
      return state;
    }
  }
  
  return null;
}

/**
 * Check if text contains a county name
 * Exported for use by geographyLookup.ts
 */
export function findCountyInText(
  text: string,
  counties: USCounty[]
): USCounty | null {
  const normalized = normalizeText(text);
  
  // Try exact match on full name
  for (const county of counties) {
    const countyName = normalizeText(county.fullName);
    if (normalized.includes(countyName)) {
      return county;
    }
  }
  
  // Try match on short name
  for (const county of counties) {
    const countyShort = normalizeText(county.shortName);
    if (normalized.includes(countyShort)) {
      return county;
    }
  }
  
  return null;
}

/**
 * Check if text contains a place name
 * Exported for use by geographyLookup.ts
 */
export function findPlaceInText(
  text: string,
  places: USPlace[]
): USPlace | null {
  const normalized = normalizeText(text);
  
  // Try exact match on full name
  for (const place of places) {
    const placeName = normalizeText(place.fullName);
    if (normalized.includes(placeName)) {
      return place;
    }
  }
  
  // Try match on short name
  for (const place of places) {
    const placeShort = normalizeText(place.shortName);
    if (normalized.includes(placeShort)) {
      return place;
    }
  }
  
  return null;
}

/**
 * Attempt to extract geography from free text using available data
 * Returns the most specific match found (place > county > state)
 */
export function extractGeographyFromText(
  text: string,
  states: USState[],
  counties: USCounty[],
  places: USPlace[]
): {
  state: USState | null;
  county: USCounty | null;
  place: USPlace | null;
} {
  const state = findStateInText(text, states);
  
  if (!state) {
    return { state: null, county: null, place: null };
  }
  
  // Filter counties and places for this state
  const stateCounties = counties.filter(c => 
    c.hierarchicalId.startsWith(state.hierarchicalId)
  );
  const statePlaces = places.filter(p => 
    p.hierarchicalId.startsWith(state.hierarchicalId)
  );
  
  const place = findPlaceInText(text, statePlaces);
  if (place) {
    // Find the county for this place
    const county = stateCounties.find(c => 
      place.hierarchicalId.startsWith(c.hierarchicalId)
    );
    return { state, county: county || null, place };
  }
  
  const county = findCountyInText(text, stateCounties);
  if (county) {
    return { state, county, place: null };
  }
  
  return { state, county: null, place: null };
}
