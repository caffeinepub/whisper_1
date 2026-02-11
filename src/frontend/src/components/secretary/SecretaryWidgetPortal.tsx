import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SecretaryWidget } from './SecretaryWidget';

interface SecretaryWidgetPortalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOptionSelect?: (optionNumber: number) => void;
  initialFlow?: 'discovery' | null;
}

export function SecretaryWidgetPortal({ open, onOpenChange, onOptionSelect, initialFlow }: SecretaryWidgetPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);

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
      open={open} 
      onClose={handleClose}
    />,
    overlayRoot
  );
}
