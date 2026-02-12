import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, FileText, CheckSquare, Upload } from 'lucide-react';
import { useGetProposal } from '@/hooks/useQueries';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { IssueProjectTasksTab } from './IssueProjectTasksTab';
import { EvidenceUploadSection } from './EvidenceUploadSection';
import { formatProposalGeography } from '@/lib/formatProposalGeography';
import { useGetIssueProjectCategory } from '@/hooks/useSetIssueProjectCategory';

interface IssueProjectDetailDialogProps {
  proposalName: string;
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

export function IssueProjectDetailDialog({
  proposalName,
  isOpen,
  onClose,
  initialCategory,
}: IssueProjectDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: proposal, isLoading } = useGetProposal(proposalName);
  const category = useGetIssueProjectCategory(proposalName);

  const displayCategory = category || initialCategory;

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  if (!proposal && !isLoading) {
    return null;
  }

  const geography = proposal ? formatProposalGeography(proposal) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-secondary" />
            {proposal?.instanceName || proposalName}
          </DialogTitle>
          <DialogDescription>
            {geography?.levelLabel || 'Loading...'} • {geography?.state || ''}
            {geography?.county ? ` • ${geography.county}` : ''}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingIndicator label="Loading proposal details..." />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="evidence" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Evidence
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {displayCategory && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <Badge variant="secondary" className="text-sm">
                    {displayCategory}
                  </Badge>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-sm">{proposal?.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge variant={proposal?.status === 'Approved' ? 'default' : 'secondary'}>
                    {proposal?.status}
                  </Badge>
                </div>

                {geography?.population && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Population</h3>
                    <p className="text-sm">{geography.population}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <IssueProjectTasksTab proposalId={proposalName} />
            </TabsContent>

            <TabsContent value="evidence" className="mt-4">
              <EvidenceUploadSection proposalId={proposalName} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
