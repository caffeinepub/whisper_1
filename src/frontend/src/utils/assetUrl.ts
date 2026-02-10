/**
 * Resolves a public static asset path in a base-path-safe way.
 * Handles cases where the app is deployed under a non-root base path.
 * 
 * @param path - The asset path relative to the public directory (e.g., '/assets/generated/image.jpg')
 * @returns The resolved URL that works with the current base path
 */
export function resolveAssetUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In production builds, Vite sets import.meta.env.BASE_URL to the configured base path
  // In development, it defaults to '/'
  const base = import.meta.env.BASE_URL || '/';
  
  // Normalize base: ensure it starts and ends with slash for consistent joining
  let normalizedBase = base;
  if (!normalizedBase.startsWith('/')) {
    normalizedBase = '/' + normalizedBase;
  }
  if (!normalizedBase.endsWith('/')) {
    normalizedBase = normalizedBase + '/';
  }
  
  // Join base and path, avoiding double slashes
  const resolved = `${normalizedBase}${cleanPath}`;
  
  return resolved;
}
