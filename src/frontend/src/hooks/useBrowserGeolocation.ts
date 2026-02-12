import { useState, useCallback } from 'react';

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface UseBrowserGeolocationReturn {
  status: GeolocationStatus;
  coordinates: GeolocationCoordinates | null;
  error: string | null;
  requestLocation: () => void;
  reset: () => void;
}

/**
 * Hook wrapping the browser Geolocation API.
 * Returns status, coordinates when available, and user-facing error messages.
 */
export function useBrowserGeolocation(): UseBrowserGeolocationReturn {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported by your browser');
      return;
    }

    setStatus('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('success');
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        setStatus('error');
        
        // Provide user-friendly error messages
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please try again.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('An unknown error occurred while getting your location.');
            break;
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setCoordinates(null);
    setError(null);
  }, []);

  return {
    status,
    coordinates,
    error,
    requestLocation,
    reset,
  };
}
