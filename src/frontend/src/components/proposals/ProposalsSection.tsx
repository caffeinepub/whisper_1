import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2 } from 'lucide-react';
import { ProposalDetailDialog } from './ProposalDetailDialog';
import { useGetAllProposals } from '@/hooks/useQueries';
import { formatProposalGeography } from '@/lib/formatProposalGeography';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { listenForProjectNavigation, type SecretaryProjectNavigationPayload } from '@/utils/secretaryProjectNavigation';
import { uiCopy } from '@/lib/uiCopy';
import type { Proposal } from '@/backend';

export function ProposalsSection() {
  const { data: proposals, isLoading, error, refetch, isRefetching } = useGetAllProposals();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoOpenCategory, setAutoOpenCategory] = useState<string | undefined>(undefined);

  // Listen for Secretary navigation events
  useEffect(() => {
    const cleanup = listenForProjectNavigation((payload: SecretaryProjectNavigationPayload) => {
      // Find the proposal by name
      const proposal = proposals?.find(([name]) => name === payload.proposalName);
      if (proposal) {
        setSelectedProposal(proposal[1]);
        setAutoOpenCategory(payload.category);
        setDialogOpen(true);
      }
    });

    return cleanup;
  }, [proposals]);

  const handleViewDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setAutoOpenCategory(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Don't clear selectedProposal immediately to avoid flash
    setTimeout(() => {
      if (!dialogOpen) {
        setSelectedProposal(null);
        setAutoOpenCategory(undefined);
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{uiCopy.proposals.title}</h2>
          <p className="text-slate-300">{uiCopy.proposals.description}</p>
        </div>
        {proposals && proposals.length > 0 && (
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="border-secondary text-secondary hover:bg-secondary/20"
          >
            {isRefetching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              uiCopy.proposals.refreshButton
            )}
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card className="bg-slate-900/80 border-slate-700">
          <CardContent className="py-12">
            <LoadingIndicator label={uiCopy.proposals.loadingMessage} />
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="bg-slate-900/80 border-slate-700">
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{uiCopy.proposals.errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()}>
              {uiCopy.proposals.retryButton}
            </Button>
          </CardContent>
        </Card>
      ) : !proposals || proposals.length === 0 ? (
        <Card className="bg-slate-900/80 border-slate-700">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <p className="text-slate-400">{uiCopy.proposals.emptyState}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map(([instanceName, proposal]) => {
            const geography = formatProposalGeography(proposal);
            return (
              <Card
                key={instanceName}
                className="bg-slate-900/80 border-slate-700 hover-lift cursor-pointer"
                onClick={() => handleViewDetails(proposal)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-white text-lg">{proposal.instanceName}</CardTitle>
                    <Badge
                      variant={
                        proposal.status === 'Approved'
                          ? 'default'
                          : proposal.status === 'Rejected'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className="shrink-0"
                    >
                      {proposal.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-300 line-clamp-2">
                    {proposal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{uiCopy.proposals.levelLabel}:</span>
                      <span className="text-white font-medium">{geography.levelLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{uiCopy.proposals.stateLabel}:</span>
                      <span className="text-white font-medium">{geography.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{uiCopy.proposals.countyLabel}:</span>
                      <span className="text-white font-medium">{geography.county}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{uiCopy.proposals.populationLabel}:</span>
                      <span className="text-white font-medium">{geography.population}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-secondary text-secondary hover:bg-secondary/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(proposal);
                    }}
                  >
                    {uiCopy.proposals.viewDetailsButton}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProposalDetailDialog
        proposal={selectedProposal}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        autoOpenIssueProject={!!autoOpenCategory}
      />
    </div>
  );
}
