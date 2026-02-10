import { useEffect, useState } from 'react';

/**
 * Hook to track the current route path for active navigation styling.
 * Listens to popstate events to detect SPA navigation changes.
 */
export function useCurrentPath(): string {
  const [currentPath, setCurrentPath] = useState(() => {
    const basePath = import.meta.env.BASE_URL || '/';
    const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    const fullPath = window.location.pathname;
    return fullPath.startsWith(normalizedBase) ? fullPath.slice(normalizedBase.length) || '/' : fullPath;
  });

  useEffect(() => {
    const handlePopState = () => {
      const basePath = import.meta.env.BASE_URL || '/';
      const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
      const fullPath = window.location.pathname;
      const relativePath = fullPath.startsWith(normalizedBase) ? fullPath.slice(normalizedBase.length) || '/' : fullPath;
      setCurrentPath(relativePath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return currentPath;
}
