import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, CheckCircle2, XCircle, MapPin, Users, Ruler } from 'lucide-react';
import { useGetProposal } from '@/hooks/useQueries';
import { useUpdateProposalStatus } from '@/hooks/useUpdateProposalStatus';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import { formatProposalGeography, getGeographyLevelLabel } from '@/lib/formatProposalGeography';

interface ProposalDetailDialogProps {
  instanceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProposalDetailDialog({ instanceName, open, onOpenChange }: ProposalDetailDialogProps) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: proposal, isLoading, error, refetch } = useGetProposal(instanceName);
  const updateStatus = useUpdateProposalStatus();

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Clear success message when dialog closes
  useEffect(() => {
    if (!open) {
      setActionSuccess(null);
      updateStatus.reset();
    }
  }, [open]);

  // Refetch proposal after successful status update
  useEffect(() => {
    if (updateStatus.isSuccess) {
      refetch();
    }
  }, [updateStatus.isSuccess, refetch]);

  const handleStatusUpdate = async (newStatus: 'Approved' | 'Rejected') => {
    try {
      await updateStatus.mutateAsync({ instanceName, newStatus });
      setActionSuccess(`Proposal ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      // Error is handled by mutation state
      console.error('Error updating proposal status:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading proposal...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Proposal</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load proposal details.'}
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Not found state
  if (!proposal) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proposal Not Found</DialogTitle>
            <DialogDescription>
              The proposal "{instanceName}" could not be found. It may have been removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusVariant =
    proposal.status === 'Approved' ? 'default' : proposal.status === 'Rejected' ? 'destructive' : 'secondary';

  const isPending = proposal.status === 'Pending';
  const canModerate = identity && isAdmin && isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl">{instanceName}</DialogTitle>
            <Badge variant={statusVariant}>{proposal.status}</Badge>
          </div>
          <DialogDescription>{proposal.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Geography Section */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Geographic Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scope:</span>
                <span className="font-medium">{getGeographyLevelLabel(proposal.geographyLevel)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium text-right">{formatProposalGeography(proposal)}</span>
              </div>
              {proposal.censusBoundaryId && proposal.censusBoundaryId !== 'empty' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Census ID:</span>
                  <span className="font-mono text-xs">{proposal.censusBoundaryId}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Demographics Section */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Demographics
            </h3>
            <div className="space-y-2 text-sm">
              {proposal.population2020 && proposal.population2020 !== 'empty' && proposal.population2020 !== 'N/A' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Population:</span>
                  <span className="font-medium">{proposal.population2020}</span>
                </div>
              )}
              {proposal.squareMeters > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Land Area:</span>
                  <span className="font-medium">
                    {(Number(proposal.squareMeters) / 1_000_000).toFixed(2)} km²
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Proposer Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Proposer</h3>
            <p className="text-xs font-mono text-muted-foreground break-all">{proposal.proposer.toString()}</p>
          </div>

          {/* Success Message */}
          {actionSuccess && (
            <Alert className="border-success/50 bg-success/5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription>{actionSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {updateStatus.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {updateStatus.error instanceof Error
                  ? updateStatus.error.message
                  : 'Failed to update proposal status. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {canModerate ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('Rejected')}
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Reject
                </Button>
                <Button onClick={() => handleStatusUpdate('Approved')} disabled={updateStatus.isPending}>
                  {updateStatus.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Approve
                </Button>
              </>
            ) : (
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
