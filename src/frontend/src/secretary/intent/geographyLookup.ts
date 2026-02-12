/**
 * Frontend geography lookup utility.
 * Performs on-demand backend calls to match state/county/place from free text,
 * enabling Secretary to fill geography slots immediately.
 * Extended with location ID resolution for task intents.
 */

import type { backendInterface, USState, USCounty, USPlace } from '@/backend';
import { findStateInText, findCountyInText, findPlaceInText } from './geographyNlp';

/**
 * Look up a US state from free text
 */
export async function lookupUSStateFromText(
  text: string,
  actor: backendInterface | null
): Promise<USState | null> {
  if (!actor) return null;

  try {
    const allStates = await actor.getAllStates();
    return findStateInText(text, allStates);
  } catch (error) {
    console.error('Error looking up state:', error);
    return null;
  }
}

/**
 * Look up a US county from free text (requires state context)
 */
export async function lookupUSCountyFromText(
  text: string,
  state: USState | null,
  actor: backendInterface | null
): Promise<USCounty | null> {
  if (!actor || !state) return null;

  try {
    const counties = await actor.getCountiesForState(state.hierarchicalId);
    return findCountyInText(text, counties);
  } catch (error) {
    console.error('Error looking up county:', error);
    return null;
  }
}

/**
 * Look up a US place from free text (requires state context)
 */
export async function lookupUSPlaceFromText(
  text: string,
  state: USState | null,
  actor: backendInterface | null
): Promise<USPlace | null> {
  if (!actor || !state) return null;

  try {
    const places = await actor.getPlacesForState(state.hierarchicalId);
    return findPlaceInText(text, places);
  } catch (error) {
    console.error('Error looking up place:', error);
    return null;
  }
}

/**
 * Resolve a location identifier from user text and/or existing geography slot state
 */
export function resolveLocationIdFromSlots(
  state: USState | null,
  county: USCounty | null,
  place: USPlace | null
): string | null {
  // Prefer most specific geography available
  if (place) {
    return place.hierarchicalId;
  }
  if (county) {
    return county.hierarchicalId;
  }
  if (state) {
    return state.hierarchicalId;
  }
  return null;
}

/**
 * Look up geography from text and derive location ID
 */
export async function lookupUSGeographyFromText(
  text: string,
  actor: backendInterface | null
): Promise<{ state: USState | null; county: USCounty | null; place: USPlace | null; locationId: string | null }> {
  const state = await lookupUSStateFromText(text, actor);
  const county = state ? await lookupUSCountyFromText(text, state, actor) : null;
  const place = state ? await lookupUSPlaceFromText(text, state, actor) : null;
  const locationId = resolveLocationIdFromSlots(state, county, place);

  return { state, county, place, locationId };
}
