import { useState, useEffect } from 'react';

interface UsePreloadedImageResult {
  isReady: boolean;
  hasError: boolean;
}

/**
 * Preloads a static image URL and exposes ready/error state.
 * Does not log warnings (caller handles diagnostics).
 * Resets state when src changes to prevent stale state.
 */
export function usePreloadedImage(src: string): UsePreloadedImageResult {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setIsReady(false);
    setHasError(false);

    if (!src) {
      setHasError(true);
      return;
    }

    const img = new Image();

    const handleLoad = () => {
      setIsReady(true);
      setHasError(false);
    };

    const handleError = () => {
      setHasError(true);
      setIsReady(false);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = src;

    // If image is already cached, it may load synchronously
    if (img.complete) {
      if (img.naturalWidth > 0) {
        handleLoad();
      } else {
        handleError();
      }
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src]);

  return { isReady, hasError };
}
