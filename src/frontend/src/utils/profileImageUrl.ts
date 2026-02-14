/**
 * Converts a profile image byte array into a browser-safe display URL.
 * Creates an object URL that should be cleaned up when no longer needed.
 * 
 * Note: Prefer using the useObjectUrl hook or UserAvatar component for automatic cleanup.
 */
export function createProfileImageUrl(imageBytes: Uint8Array | null | undefined): string | null {
  if (!imageBytes || imageBytes.length === 0) {
    return null;
  }

  try {
    // Create a new Uint8Array to ensure proper typing
    const bytes = new Uint8Array(imageBytes);
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch (error) {
    // Silently handle expected failures (e.g., invalid data)
    return null;
  }
}

/**
 * Revokes an object URL to free memory.
 * Should be called when the image is no longer displayed.
 */
export function revokeProfileImageUrl(url: string | null) {
  if (url) {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      // Silently handle revocation errors
    }
  }
}
