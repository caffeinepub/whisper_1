import { useState, useEffect } from 'react';

interface UsePreloadedImageResult {
  isReady: boolean;
  hasError: boolean;
}

/**
 * Preloads a static image URL and exposes ready/error state.
 * Logs a console warning when the image fails to load.
 */
export function usePreloadedImage(src: string): UsePreloadedImageResult {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      console.warn('usePreloadedImage: No image source provided');
      return;
    }

    const img = new Image();

    const handleLoad = () => {
      setIsReady(true);
      setHasError(false);
    };

    const handleError = (e: ErrorEvent | Event) => {
      setHasError(true);
      setIsReady(false);
      console.warn(`Failed to load image: ${src}`, e);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = src;

    // If image is already cached, it may load synchronously
    if (img.complete) {
      if (img.naturalWidth > 0) {
        handleLoad();
      } else {
        handleError(new Event('error'));
      }
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src]);

  return { isReady, hasError };
}
