import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { useGetAllProposals } from '@/hooks/useQueries';
import { ProposalDetailDialog } from './ProposalDetailDialog';
import { IconBubble } from '@/components/common/IconBubble';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import type { Proposal } from '@/backend';
import { formatProposalGeography } from '@/lib/formatProposalGeography';

interface ProposalsSectionProps {
  proposalToOpen?: string | null;
  onProposalOpened?: () => void;
}

export function ProposalsSection({ proposalToOpen, onProposalOpened }: ProposalsSectionProps) {
  const { data: proposals = [], isLoading, error, refetch, isRefetching } = useGetAllProposals();
  const [selectedProposal, setSelectedProposal] = useState<{ name: string; proposal: Proposal } | null>(null);

  // Auto-open proposal when proposalToOpen is provided
  useEffect(() => {
    if (proposalToOpen && proposals.length > 0 && !isLoading) {
      const proposalEntry = proposals.find(([name]) => name === proposalToOpen);
      if (proposalEntry) {
        const [name, proposal] = proposalEntry;
        setSelectedProposal({ name, proposal });
        if (onProposalOpened) {
          onProposalOpened();
        }
      }
    }
  }, [proposalToOpen, proposals, isLoading, onProposalOpened]);

  const handleRefresh = () => {
    refetch();
  };

  const handleProposalClick = (name: string, proposal: Proposal) => {
    setSelectedProposal({ name, proposal });
  };

  const handleCloseDialog = () => {
    setSelectedProposal(null);
  };

  if (isLoading) {
    return (
      <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconBubble size="lg" variant="secondary">
              <MapPin className="h-6 w-6" />
            </IconBubble>
            <CardTitle className="text-2xl text-white">Browse Proposals</CardTitle>
          </div>
          <CardDescription className="text-white/70">
            View and manage instance creation proposals from your community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingIndicator label="Loading proposals..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconBubble size="lg" variant="secondary">
              <MapPin className="h-6 w-6" />
            </IconBubble>
            <CardTitle className="text-2xl text-white">Browse Proposals</CardTitle>
          </div>
          <CardDescription className="text-white/70">
            View and manage instance creation proposals from your community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-destructive/20 border-destructive/50">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-white">
              Failed to load proposals. Please try again.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="mt-4 border-secondary text-secondary hover:bg-secondary/20 hover:text-secondary focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBubble size="lg" variant="secondary">
                <MapPin className="h-6 w-6" />
              </IconBubble>
              <CardTitle className="text-2xl text-white">Browse Proposals</CardTitle>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefetching}
              variant="outline"
              size="sm"
              className="border-secondary text-secondary hover:bg-secondary/20 hover:text-secondary focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              {isRefetching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          <CardDescription className="text-white/70">
            View and manage instance creation proposals from your community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No proposals yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map(([name, proposal]) => (
                <Card
                  key={name}
                  className="bg-white/5 border-white/10 hover:border-secondary/50 transition-all cursor-pointer hover-lift"
                  onClick={() => handleProposalClick(name, proposal)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white mb-1">{proposal.instanceName}</CardTitle>
                        <CardDescription className="text-white/60 text-sm">
                          {formatProposalGeography(proposal)}
                        </CardDescription>
                      </div>
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
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-white/70 text-sm line-clamp-2">{proposal.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proposal Detail Dialog */}
      {selectedProposal && (
        <ProposalDetailDialog
          proposalName={selectedProposal.name}
          proposal={selectedProposal.proposal}
          open={!!selectedProposal}
          onOpenChange={(open) => {
            if (!open) handleCloseDialog();
          }}
        />
      )}
    </>
  );
}
