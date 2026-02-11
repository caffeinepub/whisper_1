/**
 * Frontend geography lookup utility that performs on-demand backend calls
 * to match state/county/place from free text without requiring pre-populated
 * React Query caches.
 * 
 * This enables the Secretary to fill geography slots immediately on first message,
 * even before any typeahead interactions have populated the geography hooks.
 */

import type { backendInterface, USState, USCounty, USPlace } from '@/backend';
import { findStateInText, findCountyInText, findPlaceInText } from './geographyNlp';

export interface GeographyLookupResult {
  state: USState | null;
  county: USCounty | null;
  place: USPlace | null;
}

/**
 * Lookup U.S. geography from free text by calling backend actor methods.
 * Returns the most specific match found (place > county > state).
 * 
 * @param text - User's free-text input
 * @param actor - Backend actor instance
 * @returns Geography match result with state/county/place (nulls if not found)
 */
export async function lookupUSGeographyFromText(
  text: string,
  actor: backendInterface | null
): Promise<GeographyLookupResult> {
  // Return nulls if no actor available
  if (!actor) {
    console.warn('Geography lookup: No actor available');
    return { state: null, county: null, place: null };
  }

  try {
    // Step 1: Fetch all states and find a match
    const allStates = await actor.getAllStates();
    const matchedState = findStateInText(text, allStates);

    if (!matchedState) {
      // No state found in text
      return { state: null, county: null, place: null };
    }

    // Step 2: Fetch counties for the matched state
    let countiesForState: USCounty[] = [];
    try {
      countiesForState = await actor.getCountiesForState(matchedState.hierarchicalId);
    } catch (error) {
      // Backend traps if no counties found; treat as empty array
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('No counties found')) {
        console.error('Error fetching counties for state:', error);
      }
      countiesForState = [];
    }

    // Step 3: Fetch places for the matched state
    let placesForState: USPlace[] = [];
    try {
      placesForState = await actor.getPlacesForState(matchedState.hierarchicalId);
    } catch (error) {
      // Backend traps if no places found; treat as empty array
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('No places found')) {
        console.error('Error fetching places for state:', error);
      }
      placesForState = [];
    }

    // Step 4: Try to match a place (most specific)
    const matchedPlace = findPlaceInText(text, placesForState);
    if (matchedPlace) {
      // Infer county from place's hierarchicalId prefix
      const matchedCounty = countiesForState.find(c =>
        matchedPlace.hierarchicalId.startsWith(c.hierarchicalId)
      );
      return {
        state: matchedState,
        county: matchedCounty || null,
        place: matchedPlace,
      };
    }

    // Step 5: Try to match a county
    const matchedCounty = findCountyInText(text, countiesForState);
    if (matchedCounty) {
      return {
        state: matchedState,
        county: matchedCounty,
        place: null,
      };
    }

    // Step 6: Only state matched
    return {
      state: matchedState,
      county: null,
      place: null,
    };
  } catch (error) {
    // Catch any unexpected errors and log them
    console.error('Geography lookup failed:', error);
    return { state: null, county: null, place: null };
  }
}
