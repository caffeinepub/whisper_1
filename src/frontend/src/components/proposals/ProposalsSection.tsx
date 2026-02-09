import { useState } from 'react';
import { useGetAllProposals } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, AlertCircle } from 'lucide-react';
import { ProposalDetailDialog } from './ProposalDetailDialog';

export function ProposalsSection() {
  const { data: proposals, isLoading, error } = useGetAllProposals();
  const [selectedInstanceName, setSelectedInstanceName] = useState<string | null>(null);

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

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold mb-2">Instance Proposals</h3>
        <p className="text-muted-foreground">
          Review and manage proposals for new Whisper instances across different jurisdictions.
        </p>
      </div>

      <Separator />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load proposals. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && proposals && proposals.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No proposals yet</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              When users submit proposals to create new Whisper instances, they will appear here for review.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Proposals List */}
      {!isLoading && !error && proposals && proposals.length > 0 && (
        <div className="space-y-4">
          {proposals.map(([instanceName, proposal]) => (
            <Card key={instanceName} className="border-border shadow-xs hover:shadow-sm transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{proposal.instanceName}</CardTitle>
                    <CardDescription className="mt-1">
                      Proposed by: {proposal.proposer.toString()}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(proposal.status)} className={getStatusClassName(proposal.status)}>
                    {proposal.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {proposal.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInstanceName(instanceName)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedInstanceName && (
        <ProposalDetailDialog
          instanceName={selectedInstanceName}
          open={!!selectedInstanceName}
          onOpenChange={(open) => {
            if (!open) setSelectedInstanceName(null);
          }}
        />
      )}
    </section>
  );
}
