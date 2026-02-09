import { useState, useEffect } from 'react';
import { useGetProposal } from '@/hooks/useQueries';
import { useUpdateProposalStatus } from '@/hooks/useUpdateProposalStatus';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ProposalDetailDialogProps {
  instanceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProposalDetailDialog({ instanceName, open, onOpenChange }: ProposalDetailDialogProps) {
  const { data: proposal, isLoading, error, refetch } = useGetProposal(instanceName);
  const updateStatus = useUpdateProposalStatus();
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Clear feedback when dialog opens/closes or proposal changes
  useEffect(() => {
    setFeedbackMessage(null);
  }, [open, instanceName]);

  const handleStatusUpdate = async (newStatus: string) => {
    setFeedbackMessage(null);
    try {
      await updateStatus.mutateAsync({ instanceName, newStatus });
      setFeedbackMessage({
        type: 'success',
        text: `Proposal successfully ${newStatus.toLowerCase()}.`,
      });
      // Refetch to show updated status immediately
      await refetch();
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update proposal status.',
      });
    }
  };

  const getStatusVariant = (status: string): 'default' | 'outline' | 'secondary' | 'destructive' => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'approved') return 'default';
    if (lowerStatus === 'rejected') return 'destructive';
    return 'secondary';
  };

  const getStatusClassName = (status: string): string => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'approved') return 'badge-resolved';
    if (lowerStatus === 'rejected') return 'badge-rejected';
    return 'badge-in-progress';
  };

  const canUpdateStatus = proposal && proposal.status.toLowerCase() === 'pending';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Proposal Details</DialogTitle>
          <DialogDescription>
            Review the full details of this instance creation proposal.
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load proposal details. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Not Found State */}
        {!isLoading && !error && proposal === null && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Proposal not found. It may have been removed or the instance name is incorrect.
            </AlertDescription>
          </Alert>
        )}

        {/* Proposal Content */}
        {!isLoading && !error && proposal && (
          <div className="space-y-6 py-4">
            {/* Instance Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Instance Name</label>
              <p className="text-lg font-semibold mt-1">{proposal.instanceName}</p>
            </div>

            <Separator />

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-2">
                <Badge variant={getStatusVariant(proposal.status)} className={getStatusClassName(proposal.status)}>
                  {proposal.status}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Proposer */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Proposer</label>
              <p className="text-sm font-mono mt-1 break-all">{proposal.proposer.toString()}</p>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm mt-2 whitespace-pre-wrap">{proposal.description}</p>
            </div>

            {/* Feedback Message */}
            {feedbackMessage && (
              <Alert variant={feedbackMessage.type === 'error' ? 'destructive' : 'default'}>
                {feedbackMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{feedbackMessage.text}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Footer with Action Buttons */}
        {!isLoading && !error && proposal && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {canUpdateStatus ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('Rejected')}
                  disabled={updateStatus.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleStatusUpdate('Approved')}
                  disabled={updateStatus.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Close
              </Button>
            )}
          </DialogFooter>
        )}

        {/* Footer for Not Found State */}
        {!isLoading && !error && proposal === null && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
