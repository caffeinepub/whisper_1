import { useState, useCallback } from 'react';
import type { USState, USCounty, USPlace } from '@/backend';

export interface LocationSelection {
  state: USState | null;
  county: USCounty | null;
  place: USPlace | null;
}

export interface UseLocationSelectionReturn {
  selection: LocationSelection;
  setSelectedState: (state: USState | null) => void;
  setSelectedCounty: (county: USCounty | null) => void;
  setSelectedPlace: (place: USPlace | null) => void;
  locationId: string | null;
  displayName: string | null;
  reset: () => void;
}

/**
 * Hook to manage location selection with dependency clearing.
 * Derives a canonical locationId (hierarchicalId) preferring place > county > state.
 */
export function useLocationSelection(): UseLocationSelectionReturn {
  const [selection, setSelection] = useState<LocationSelection>({
    state: null,
    county: null,
    place: null,
  });

  const setSelectedState = useCallback((state: USState | null) => {
    setSelection({
      state,
      county: null, // Clear dependent selections
      place: null,
    });
  }, []);

  const setSelectedCounty = useCallback((county: USCounty | null) => {
    setSelection((prev) => ({
      ...prev,
      county,
      place: null, // Clear dependent selection
    }));
  }, []);

  const setSelectedPlace = useCallback((place: USPlace | null) => {
    setSelection((prev) => ({
      ...prev,
      place,
    }));
  }, []);

  const reset = useCallback(() => {
    setSelection({
      state: null,
      county: null,
      place: null,
    });
  }, []);

  // Derive locationId: prefer place > county > state
  const locationId = selection.place?.hierarchicalId 
    || selection.county?.hierarchicalId 
    || selection.state?.hierarchicalId 
    || null;

  // Derive display name for UI
  const displayName = selection.place?.shortName 
    || selection.county?.shortName 
    || selection.state?.longName 
    || null;

  return {
    selection,
    setSelectedState,
    setSelectedCounty,
    setSelectedPlace,
    locationId,
    displayName,
    reset,
  };
}
