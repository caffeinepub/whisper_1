import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useGovernanceVote } from '@/hooks/useGovernanceProposals';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { toast } from 'sonner';
import { uiCopy } from '@/lib/uiCopy';
import type { GovernanceProposal } from '@/backend';

interface GovernanceProposalDetailDialogProps {
  proposal: GovernanceProposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Governance proposal detail dialog showing description, status, tallies, and vote controls
 * with authenticated gating and query invalidation on vote.
 */
export function GovernanceProposalDetailDialog({
  proposal,
  open,
  onOpenChange,
}: GovernanceProposalDetailDialogProps) {
  const { identity } = useInternetIdentity();
  const voteMutation = useGovernanceVote();
  const [votingFor, setVotingFor] = useState<'approve' | 'reject' | null>(null);

  const isAuthenticated = !!identity;

  if (!proposal) return null;

  const hasVoted = identity
    ? proposal.votes.votes.some((v) => v.voter.toString() === identity.getPrincipal().toString())
    : false;

  const canVote = isAuthenticated && !hasVoted && (proposal.status === 'pending' || proposal.status === 'active');

  const handleVote = async (approve: boolean) => {
    if (!isAuthenticated) {
      toast.error(uiCopy.governance.authRequired);
      return;
    }

    setVotingFor(approve ? 'approve' : 'reject');
    try {
      await voteMutation.mutateAsync({ proposalId: proposal.id, approve });
      toast.success(approve ? uiCopy.governance.voteApproveSuccess : uiCopy.governance.voteRejectSuccess);
    } catch (error: any) {
      toast.error(error.message || uiCopy.governance.voteError);
    } finally {
      setVotingFor(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{proposal.title}</DialogTitle>
              <DialogDescription className="text-base">{proposal.description}</DialogDescription>
            </div>
            <Badge
              variant={
                proposal.status === 'approved'
                  ? 'default'
                  : proposal.status === 'rejected'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {proposal.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Vote Tallies */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{uiCopy.governance.voteTalliesLabel}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/10 border border-secondary rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{uiCopy.governance.approvedLabel}</p>
                <p className="text-3xl font-bold text-secondary">{proposal.votes.tally.approved.toString()}</p>
              </div>
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{uiCopy.governance.rejectedLabel}</p>
                <p className="text-3xl font-bold text-destructive">{proposal.votes.tally.rejected.toString()}</p>
              </div>
            </div>
          </div>

          {/* Voting Controls */}
          {!isAuthenticated ? (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">{uiCopy.governance.authRequired}</p>
            </div>
          ) : hasVoted ? (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">{uiCopy.governance.alreadyVoted}</p>
            </div>
          ) : canVote ? (
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-lg mb-3">{uiCopy.governance.castVoteLabel}</h3>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleVote(true)}
                  disabled={votingFor !== null}
                  className="flex-1 bg-secondary hover:bg-secondary/90"
                >
                  {votingFor === 'approve' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {uiCopy.governance.votingLabel}
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {uiCopy.governance.approveButton}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleVote(false)}
                  disabled={votingFor !== null}
                  variant="destructive"
                  className="flex-1"
                >
                  {votingFor === 'reject' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {uiCopy.governance.votingLabel}
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      {uiCopy.governance.rejectButton}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">{uiCopy.governance.votingClosed}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
