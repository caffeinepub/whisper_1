import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SecretaryWidget } from './SecretaryWidget';

interface SecretaryWidgetPortalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOptionSelect?: (optionNumber: number) => void;
}

export function SecretaryWidgetPortal({ open, onOpenChange, onOptionSelect }: SecretaryWidgetPortalProps) {
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

  if (!mounted || !overlayRoot) {
    return null;
  }

  return createPortal(
    <SecretaryWidget open={open} onOpenChange={onOpenChange} onOptionSelect={onOptionSelect} />,
    overlayRoot
  );
}
