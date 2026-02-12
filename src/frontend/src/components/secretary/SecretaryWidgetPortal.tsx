/**
 * Portal wrapper that mounts SecretaryWidget into the dedicated overlay-root container,
 * creating and managing the FlowEngineBrain instance internally.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SecretaryWidget } from './SecretaryWidget';
import { FlowEngineBrain } from '@/secretary/brain/FlowEngineBrain';
import { useActor } from '@/hooks/useActor';
import { useGetAllStates, useGetCountiesForState, useGetPlacesForState } from '@/hooks/useUSGeography';

interface NavigationRequest {
  destinationId: string;
  shouldClose: boolean;
}

interface SecretaryWidgetPortalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  navigationHandler?: (request: NavigationRequest) => void;
  findByKeyword?: (text: string) => { id: string } | null;
}

export function SecretaryWidgetPortal({ 
  open, 
  onOpenChange, 
  navigationHandler,
  findByKeyword 
}: SecretaryWidgetPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  const { actor } = useActor();
  const [brain] = useState(() => new FlowEngineBrain(actor));
  
  // Geography data for typeahead
  const { data: states = [] } = useGetAllStates();
  const { data: counties = [] } = useGetCountiesForState(
    brain.getContext().slots.state?.hierarchicalId || null
  );
  const { data: places = [] } = useGetPlacesForState(
    brain.getContext().slots.state?.hierarchicalId || null
  );

  // Update brain with actor when it changes
  useEffect(() => {
    brain.setActor(actor);
  }, [actor, brain]);

  // Update brain with geography data
  useEffect(() => {
    brain.setGeographyData(states, counties, places);
  }, [states, counties, places, brain]);

  useEffect(() => {
    setMounted(true);
    
    // Get or create the overlay root container
    let container = document.getElementById('overlay-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'overlay-root';
      document.body.appendChild(container);
    }
    setOverlayRoot(container);

    return () => setMounted(false);
  }, []);

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Don't render anything if not open
  if (!open || !mounted || !overlayRoot) {
    return null;
  }

  return createPortal(
    <SecretaryWidget 
      isOpen={open} 
      onClose={handleClose}
      brain={brain}
      onNavigate={navigationHandler}
      findByKeyword={findByKeyword}
    />,
    overlayRoot
  );
}
