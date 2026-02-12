import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconBubble } from '@/components/common/IconBubble';
import { Vote, Loader2, Plus, FileText } from 'lucide-react';
import { useGovernanceListProposals } from '@/hooks/useGovernanceProposals';
import { GovernanceProposalDetailDialog } from './GovernanceProposalDetailDialog';
import { CreateGovernanceProposalDialog } from './CreateGovernanceProposalDialog';
import { uiCopy } from '@/lib/uiCopy';
import type { GovernanceProposal } from '@/backend';

/**
 * Governance section that lists governance proposals with loading/empty/error states
 * and opens detail/create dialogs.
 */
export function GovernanceSection() {
  const { data: proposals, isLoading, error } = useGovernanceListProposals();
  const [selectedProposal, setSelectedProposal] = useState<GovernanceProposal | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleViewDetails = (proposal: GovernanceProposal) => {
    setSelectedProposal(proposal);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setTimeout(() => setSelectedProposal(null), 300);
  };

  return (
    <>
      <Card id="governance-section">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBubble size="md" variant="secondary">
                <Vote className="h-5 w-5" />
              </IconBubble>
              <div>
                <CardTitle>{uiCopy.governance.title}</CardTitle>
                <CardDescription>{uiCopy.governance.description}</CardDescription>
              </div>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {uiCopy.governance.createButton}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{uiCopy.governance.errorMessage}</p>
            </div>
          ) : !proposals || proposals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{uiCopy.governance.emptyState}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id.toString()}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(proposal)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{proposal.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          {uiCopy.governance.approvedLabel}: {proposal.votes.tally.approved.toString()}
                        </span>
                        <span>
                          {uiCopy.governance.rejectedLabel}: {proposal.votes.tally.rejected.toString()}
                        </span>
                      </div>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <GovernanceProposalDetailDialog
        proposal={selectedProposal}
        open={detailDialogOpen}
        onOpenChange={handleCloseDetail}
      />

      <CreateGovernanceProposalDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </>
  );
}
