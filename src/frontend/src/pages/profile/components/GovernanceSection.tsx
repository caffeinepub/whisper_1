import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gavel, Loader2, Plus, FileText, Sparkles } from 'lucide-react';
import { useGovernanceListProposals } from '@/hooks/useGovernanceProposals';
import { GovernanceProposalDetailDialog } from './GovernanceProposalDetailDialog';
import { CreateGovernanceProposalDialog } from './CreateGovernanceProposalDialog';
import { uiCopy } from '@/lib/uiCopy';
import type { GovernanceProposal } from '@/backend';

/**
 * Governance section with glassmorphism design, purple/pink gradient accents, enhanced proposal cards with hover/focus micro-interactions, improved empty state with motivational copy, and all original proposal management logic intact.
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
      <Card id="governance-section" className="border-gray-700 bg-gray-900/80 backdrop-blur-sm shadow-2xl">
        <CardHeader className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg">
                <Gavel className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">{uiCopy.governance.title}</CardTitle>
                <CardDescription className="text-base text-gray-300">{uiCopy.governance.description}</CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => setCreateDialogOpen(true)} 
              size="lg"
              className="min-h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-base shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <Plus className="h-5 w-5 mr-2" />
              {uiCopy.governance.createButton}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-base font-medium text-red-400 mb-4">{uiCopy.governance.errorMessage}</p>
            </div>
          ) : !proposals || proposals.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg">
                  <FileText className="h-12 w-12 text-purple-400" />
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-white mb-2">{uiCopy.governance.emptyState}</p>
                <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Create your first proposal to shape the community!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id.toString()}
                  className="border border-gray-700 rounded-xl p-6 bg-gray-800/50 hover:bg-gray-800/70 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  onClick={() => handleViewDetails(proposal)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleViewDetails(proposal);
                    }
                  }}
                  aria-label={`View details for proposal: ${proposal.title}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-2">{proposal.title}</h4>
                      <p className="text-base text-gray-300 line-clamp-2 mb-3">{proposal.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 font-medium">
                          {uiCopy.governance.approvedLabel}: {proposal.votes.tally.approved.toString()}
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 font-medium">
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
                      className="capitalize text-sm font-bold px-3 py-1"
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
