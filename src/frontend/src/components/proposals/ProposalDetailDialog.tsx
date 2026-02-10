import { useState } from 'react';
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
import { MapPin, Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { IconBubble } from '@/components/common/IconBubble';
import { useUpdateProposalStatus } from '@/hooks/useUpdateProposalStatus';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import type { Proposal } from '@/backend';
import { formatProposalGeography, getGeographyLevelLabel } from '@/lib/formatProposalGeography';

interface ProposalDetailDialogProps {
  proposalName: string;
  proposal: Proposal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProposalDetailDialog({ proposalName, proposal, open, onOpenChange }: ProposalDetailDialogProps) {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { mutate: updateStatus, isPending } = useUpdateProposalStatus();
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = () => {
    setActionType('approve');
    updateStatus(
      { instanceName: proposalName, newStatus: 'Approved' },
      {
        onSuccess: () => {
          onOpenChange(false);
          setActionType(null);
        },
        onError: () => {
          setActionType(null);
        },
      }
    );
  };

  const handleReject = () => {
    setActionType('reject');
    updateStatus(
      { instanceName: proposalName, newStatus: 'Rejected' },
      {
        onSuccess: () => {
          onOpenChange(false);
          setActionType(null);
        },
        onError: () => {
          setActionType(null);
        },
      }
    );
  };

  const canModerate = isAdmin && proposal.status === 'Pending';
  const isApproving = isPending && actionType === 'approve';
  const isRejecting = isPending && actionType === 'reject';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <IconBubble size="lg" variant="secondary">
              <MapPin className="h-6 w-6" />
            </IconBubble>
            <DialogTitle className="text-2xl">{proposal.instanceName}</DialogTitle>
          </div>
          <DialogDescription className="text-white/70">
            {formatProposalGeography(proposal)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Status:</span>
            <Badge
              variant={
                proposal.status === 'Approved'
                  ? 'default'
                  : proposal.status === 'Rejected'
                    ? 'destructive'
                    : 'secondary'
              }
              className={
                proposal.status === 'Pending'
                  ? 'bg-secondary/20 text-secondary border-secondary/30'
                  : ''
              }
            >
              {proposal.status}
            </Badge>
          </div>

          <Separator className="bg-white/10" />

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <IconBubble size="sm" variant="secondary">
                <AlertCircle className="h-4 w-4" />
              </IconBubble>
              Description
            </h4>
            <p className="text-white/80 leading-relaxed">{proposal.description}</p>
          </div>

          <Separator className="bg-white/10" />

          {/* Geography Details */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <IconBubble size="sm" variant="secondary">
                <MapPin className="h-4 w-4" />
              </IconBubble>
              Geography Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Level:</span>
                <p className="text-white">{getGeographyLevelLabel(proposal.geographyLevel)}</p>
              </div>
              <div>
                <span className="text-white/60">State:</span>
                <p className="text-white">{proposal.state}</p>
              </div>
              {proposal.county && proposal.county !== 'N/A' && (
                <div>
                  <span className="text-white/60">County:</span>
                  <p className="text-white">{proposal.county}</p>
                </div>
              )}
              <div>
                <span className="text-white/60">Census ID:</span>
                <p className="text-white font-mono text-xs">{proposal.censusBoundaryId}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Demographics */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <IconBubble size="sm" variant="secondary">
                <Users className="h-4 w-4" />
              </IconBubble>
              Demographics
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Population (2020):</span>
                <p className="text-white">{proposal.population2020}</p>
              </div>
              <div>
                <span className="text-white/60">Area:</span>
                <p className="text-white">{(Number(proposal.squareMeters) / 1_000_000).toFixed(2)} km²</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {canModerate ? (
            <>
              <Button
                onClick={handleApprove}
                disabled={isPending}
                className="bg-success hover:bg-success/90 text-white font-semibold"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isPending}
                className="border-secondary text-secondary hover:bg-secondary/20 hover:text-secondary focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject'
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-secondary text-secondary hover:bg-secondary/20 hover:text-secondary focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
