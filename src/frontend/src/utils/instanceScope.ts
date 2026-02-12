const LAST_LOCATION_ID_KEY = 'whisper-last-location-id';

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
