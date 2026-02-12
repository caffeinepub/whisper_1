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
import { Loader2, FolderKanban } from 'lucide-react';
import { IssueProjectDetailDialog } from '@/components/issue-project/IssueProjectDetailDialog';
import { useGetProposal } from '@/hooks/useQueries';
import { formatProposalGeography } from '@/lib/formatProposalGeography';
import { uiCopy } from '@/lib/uiCopy';
import type { Proposal } from '@/backend';

interface ProposalDetailDialogProps {
  proposal: Proposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoOpenIssueProject?: boolean;
}

export function ProposalDetailDialog({ 
  proposal, 
  open, 
  onOpenChange,
  autoOpenIssueProject = false 
}: ProposalDetailDialogProps) {
  const [showIssueProject, setShowIssueProject] = useState(false);

  // Fetch live proposal data when dialog is open
  const { data: liveProposal, isLoading } = useGetProposal(proposal?.instanceName || '');

  // Use live data if available, fallback to passed proposal
  const displayProposal = liveProposal || proposal;

  // Auto-open Issue Project if requested
  useEffect(() => {
    if (autoOpenIssueProject && displayProposal && open) {
      // Small delay to ensure dialog is mounted
      setTimeout(() => {
        setShowIssueProject(true);
      }, 100);
    }
  }, [autoOpenIssueProject, displayProposal, open]);

  if (!displayProposal) return null;

  const geography = formatProposalGeography(displayProposal);

  const handleOpenIssueProject = () => {
    setShowIssueProject(true);
  };

  const handleCloseIssueProject = () => {
    setShowIssueProject(false);
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    // When closing the main dialog, also close the Issue Project dialog
    if (!newOpen) {
      setShowIssueProject(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open && !showIssueProject} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">{displayProposal.instanceName}</DialogTitle>
                <DialogDescription className="text-base">
                  {displayProposal.description}
                </DialogDescription>
              </div>
              <Badge
                variant={
                  displayProposal.status === 'Approved'
                    ? 'default'
                    : displayProposal.status === 'Rejected'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {displayProposal.status}
              </Badge>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {/* Geography Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{uiCopy.proposals.geographyLabel}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{uiCopy.proposals.levelLabel}:</span>
                    <p className="font-medium">{geography.levelLabel}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{uiCopy.proposals.stateLabel}:</span>
                    <p className="font-medium">{geography.state}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{uiCopy.proposals.countyLabel}:</span>
                    <p className="font-medium">{geography.county}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{uiCopy.proposals.populationLabel}:</span>
                    <p className="font-medium">{geography.population}</p>
                  </div>
                </div>
              </div>

              {/* Issue Project Button */}
              {displayProposal.status === 'Approved' && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleOpenIssueProject}
                    className="w-full bg-secondary hover:bg-secondary/90"
                  >
                    <FolderKanban className="h-4 w-4 mr-2" />
                    {uiCopy.proposals.openIssueProjectButton}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issue Project Dialog */}
      {showIssueProject && (
        <IssueProjectDetailDialog
          proposalName={displayProposal.instanceName}
          isOpen={showIssueProject}
          onClose={handleCloseIssueProject}
        />
      )}
    </>
  );
}
