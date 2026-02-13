import { useEffect } from 'react';
import { useLocationSelection } from './useLocationSelection';
import type { USState, USCounty, USPlace } from '@/backend';

const LOCATION_METADATA_KEY = 'whisper-location-metadata';

interface LocationMetadata {
  locationId: string;
  stateName: string;
  countyName?: string;
  placeName?: string;
}

/**
 * Hook that persists/restores the selected canonical locationId and metadata
 * using localStorage for session persistence.
 */
export function useInstanceScopeLocation() {
  const locationSelection = useLocationSelection();

  // Persist location metadata whenever selection changes
  useEffect(() => {
    if (locationSelection.locationId) {
      const metadata: LocationMetadata = {
        locationId: locationSelection.locationId,
        stateName: locationSelection.selection.state?.longName || '',
        countyName: locationSelection.selection.county?.shortName,
        placeName: locationSelection.selection.place?.shortName,
      };

      try {
        localStorage.setItem(LOCATION_METADATA_KEY, JSON.stringify(metadata));
        localStorage.setItem('whisper-last-location-id', locationSelection.locationId);
      } catch (error) {
        console.error('Error persisting location metadata:', error);
      }
    }
  }, [locationSelection.locationId, locationSelection.selection]);

  // Restore location metadata on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCATION_METADATA_KEY);
      if (stored) {
        const metadata: LocationMetadata = JSON.parse(stored);
        // Note: We store metadata but don't auto-restore selection
        // The UI will handle restoration if needed
      }
    } catch (error) {
      console.error('Error restoring location metadata:', error);
    }
  }, []);

  const clearPersistedLocation = () => {
    try {
      localStorage.removeItem(LOCATION_METADATA_KEY);
      localStorage.removeItem('whisper-last-location-id');
    } catch (error) {
      console.error('Error clearing persisted location:', error);
    }
  };

  return {
    ...locationSelection,
    clearPersistedLocation,
  };
}

/**
 * Retrieves persisted location metadata from localStorage.
 */
export function getPersistedLocationMetadata(): LocationMetadata | null {
  try {
    const stored = localStorage.getItem(LOCATION_METADATA_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading persisted location metadata:', error);
  }
  return null;
}
