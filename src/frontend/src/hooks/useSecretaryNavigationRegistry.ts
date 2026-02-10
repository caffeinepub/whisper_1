import { useCallback, useRef } from 'react';

export type NavigationDestination = {
  id: string;
  label: string;
  keywords: string[];
  action: () => void;
};

export function useSecretaryNavigationRegistry() {
  const registry = useRef<Map<string, NavigationDestination>>(new Map());

  const register = useCallback((destination: NavigationDestination) => {
    registry.current.set(destination.id, destination);
  }, []);

  const unregister = useCallback((id: string) => {
    registry.current.delete(id);
  }, []);

  const navigate = useCallback((destinationId: string): boolean => {
    const destination = registry.current.get(destinationId);
    if (destination) {
      destination.action();
      return true;
    }
    return false;
  }, []);

  const findByKeyword = useCallback((text: string): NavigationDestination | null => {
    const lowerText = text.toLowerCase();
    
    for (const destination of registry.current.values()) {
      if (destination.keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
        return destination;
      }
    }
    
    return null;
  }, []);

  const getAll = useCallback((): NavigationDestination[] => {
    return Array.from(registry.current.values());
  }, []);

  return {
    register,
    unregister,
    navigate,
    findByKeyword,
    getAll,
  };
}
