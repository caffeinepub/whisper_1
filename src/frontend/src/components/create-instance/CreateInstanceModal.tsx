import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CreateInstancePlaceholderCard } from './CreateInstancePlaceholderCard';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreateInstanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInstanceModal({ open, onOpenChange }: CreateInstanceModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleProposalSubmitted = () => {
    setShowSuccess(true);
    // Auto-close after showing success message
    setTimeout(() => {
      setShowSuccess(false);
      onOpenChange(false);
    }, 2500);
  };

  const handleClose = () => {
    setShowSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Instance</DialogTitle>
          <DialogDescription>
            Propose a new Whisper instance for your community
          </DialogDescription>
        </DialogHeader>
        
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-success" />
            <h3 className="text-xl font-semibold">Proposal Submitted!</h3>
            <p className="text-muted-foreground text-center">
              Your instance proposal has been submitted for review.
            </p>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        ) : (
          <CreateInstancePlaceholderCard 
            onClose={handleClose}
            onProposalSubmitted={handleProposalSubmitted}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
