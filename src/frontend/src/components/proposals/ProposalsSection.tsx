import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, FileText, MapPin } from 'lucide-react';
import { useGetAllProposals } from '@/hooks/useQueries';
import { ProposalDetailDialog } from './ProposalDetailDialog';
import { formatProposalGeography, getGeographyLevelLabel } from '@/lib/formatProposalGeography';

export function ProposalsSection() {
  const [selectedProposalName, setSelectedProposalName] = useState<string | null>(null);

  const { data: proposals = [], isLoading, error, isFetched } = useGetAllProposals();

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading proposals...</span>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load proposals. Please try again.'}
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  // Empty state
  if (isFetched && proposals.length === 0) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <Card className="border-muted">
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle>No Proposals Yet</CardTitle>
              <CardDescription>
                Instance creation proposals will appear here once submitted.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    );
  }

  // Proposals list
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Instance Creation Proposals</h2>
          <p className="text-muted-foreground">
            Community proposals for new Whisper installations across the United States
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {proposals.map(([instanceName, proposal]) => {
            const statusVariant =
              proposal.status === 'Approved'
                ? 'default'
                : proposal.status === 'Rejected'
                  ? 'destructive'
                  : 'secondary';

            return (
              <Card key={instanceName} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-1">{instanceName}</CardTitle>
                    <Badge variant={statusVariant} className="shrink-0">
                      {proposal.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{proposal.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Geography Information */}
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {getGeographyLevelLabel(proposal.geographyLevel)}
                      </div>
                      <div className="text-xs">{formatProposalGeography(proposal)}</div>
                    </div>
                  </div>

                  {/* Proposer */}
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Proposer:</span>{' '}
                    <span className="font-mono">{proposal.proposer.toString().slice(0, 12)}...</span>
                  </div>

                  {/* View Details Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedProposalName(instanceName)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Proposal Detail Dialog */}
      {selectedProposalName && (
        <ProposalDetailDialog
          instanceName={selectedProposalName}
          open={!!selectedProposalName}
          onOpenChange={(open) => {
            if (!open) setSelectedProposalName(null);
          }}
        />
      )}
    </section>
  );
}
