import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useGovernanceCreateProposal } from '@/hooks/useGovernanceProposals';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { toast } from 'sonner';
import { uiCopy } from '@/lib/uiCopy';

interface CreateGovernanceProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Create governance proposal dialog with title/description inputs, submit pending state,
 * and clear English success/failure feedback.
 */
export function CreateGovernanceProposalDialog({ open, onOpenChange }: CreateGovernanceProposalDialogProps) {
  const { identity } = useInternetIdentity();
  const createMutation = useGovernanceCreateProposal();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const isAuthenticated = !!identity;

  const handleSubmit = async () => {
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!isAuthenticated) {
      setError(uiCopy.governance.authRequired);
      return;
    }

    try {
      await createMutation.mutateAsync({ title: title.trim(), description: description.trim() });
      toast.success(uiCopy.governance.createSuccess);
      setTitle('');
      setDescription('');
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.message || uiCopy.governance.createError;
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{uiCopy.governance.createDialogTitle}</DialogTitle>
          <DialogDescription>{uiCopy.governance.createDialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!isAuthenticated && (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">{uiCopy.governance.authRequired}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">{uiCopy.governance.titleLabel}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder={uiCopy.governance.titlePlaceholder}
              disabled={!isAuthenticated || createMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{uiCopy.governance.descriptionLabel}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError('');
              }}
              placeholder={uiCopy.governance.descriptionPlaceholder}
              rows={6}
              disabled={!isAuthenticated || createMutation.isPending}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={createMutation.isPending}>
              {uiCopy.common.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={!isAuthenticated || createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uiCopy.governance.submitting}
                </>
              ) : (
                uiCopy.governance.submitButton
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
