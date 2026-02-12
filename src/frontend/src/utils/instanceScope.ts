const LAST_LOCATION_ID_KEY = 'whisper-last-location-id';
const LOCATION_METADATA_KEY = 'whisper-location-metadata';

export interface LocationMetadata {
  locationId: string;
  stateName: string;
  countyName?: string;
  placeName?: string;
}

export function setLastUsedLocationId(locationId: string): void {
  try {
    localStorage.setItem(LAST_LOCATION_ID_KEY, locationId);
  } catch (error) {
    console.error('Error saving last location ID:', error);
  }
}

export function getLastUsedLocationId(): string | null {
  try {
    return localStorage.getItem(LAST_LOCATION_ID_KEY);
  } catch (error) {
    console.error('Error reading last location ID:', error);
    return null;
  }
}

export function setLocationMetadata(metadata: LocationMetadata): void {
  try {
    localStorage.setItem(LOCATION_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error saving location metadata:', error);
  }
}

export function getLocationMetadata(): LocationMetadata | null {
  try {
    const stored = localStorage.getItem(LOCATION_METADATA_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate structure
      if (parsed && typeof parsed.locationId === 'string' && typeof parsed.stateName === 'string') {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading location metadata:', error);
  }
  return null;
}

export function clearLocationData(): void {
  try {
    localStorage.removeItem(LAST_LOCATION_ID_KEY);
    localStorage.removeItem(LOCATION_METADATA_KEY);
  } catch (error) {
    console.error('Error clearing location data:', error);
  }
}
