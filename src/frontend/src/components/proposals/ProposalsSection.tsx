import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, FileText, Loader2 } from 'lucide-react';
import { useGetAllProposals } from '@/hooks/useQueries';
import { ProposalDetailDialog } from './ProposalDetailDialog';
import { IconBubble } from '@/components/common/IconBubble';
import type { Proposal } from '@/backend';
import { formatProposalGeography } from '@/lib/formatProposalGeography';

export function ProposalsSection() {
  const { data: proposals, isLoading, error } = useGetAllProposals();
  const [selectedProposal, setSelectedProposal] = useState<{ name: string; proposal: Proposal } | null>(null);

  if (isLoading) {
    return (
      <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 shadow-[0_0_30px_rgba(20,184,166,0.2)] rounded-2xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="text-white/70">Loading proposals...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[oklch(0.20_0.05_230)] border-destructive/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] rounded-2xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-destructive">Error loading proposals</p>
            <p className="text-white/60 text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const proposalsList = proposals || [];

  return (
    <>
      <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 shadow-[0_0_30px_rgba(20,184,166,0.2)] rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <IconBubble size="lg" variant="secondary">
              <FileText className="h-6 w-6" />
            </IconBubble>
            <CardTitle className="text-2xl text-white">Browse Proposals</CardTitle>
          </div>
          <CardDescription className="text-white/70">
            View and moderate instance creation proposals from your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proposalsList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">No proposals yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposalsList.map(([name, proposal]) => (
                <div
                  key={name}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <IconBubble size="sm" variant="secondary">
                          <MapPin className="h-4 w-4" />
                        </IconBubble>
                        <h4 className="font-semibold text-white">{proposal.instanceName}</h4>
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
                      <p className="text-white/70 text-sm">{formatProposalGeography(proposal)}</p>
                      <p className="text-white/60 text-sm line-clamp-2">{proposal.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProposal({ name, proposal })}
                      className="border-secondary text-secondary hover:bg-secondary/20 hover:text-secondary focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProposal && (
        <ProposalDetailDialog
          proposalName={selectedProposal.name}
          proposal={selectedProposal.proposal}
          open={!!selectedProposal}
          onOpenChange={(open) => !open && setSelectedProposal(null)}
        />
      )}
    </>
  );
}
