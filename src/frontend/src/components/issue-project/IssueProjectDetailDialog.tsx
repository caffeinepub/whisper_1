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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, FileText, CheckSquare, Upload, ArrowRight, Loader2 } from 'lucide-react';
import { useGetProposal } from '@/hooks/useQueries';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { IssueProjectTasksTab } from './IssueProjectTasksTab';
import { EvidenceUploadSection } from './EvidenceUploadSection';
import { formatProposalGeography } from '@/lib/formatProposalGeography';
import { useGetIssueProjectCategory } from '@/hooks/useSetIssueProjectCategory';
import { useListTasksByIssueId, useConvertIssueToTask } from '@/hooks/useTasks';
import { joinBasePath } from '@/utils/assetUrl';
import { uiCopy } from '@/lib/uiCopy';
import { toast } from 'sonner';
import { TaskStatus } from '@/backend';

interface IssueProjectDetailDialogProps {
  proposalName: string;
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

function getStatusBadgeVariant(status: TaskStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case TaskStatus.open:
      return 'default';
    case TaskStatus.in_progress:
      return 'secondary';
    case TaskStatus.blocked:
      return 'destructive';
    case TaskStatus.resolved:
      return 'outline';
    default:
      return 'default';
  }
}

function formatStatus(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.open:
      return 'Open';
    case TaskStatus.in_progress:
      return 'In Progress';
    case TaskStatus.blocked:
      return 'Blocked';
    case TaskStatus.resolved:
      return 'Resolved';
    default:
      return status;
  }
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
  const {
    data: relatedTasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useListTasksByIssueId(proposalName);
  const convertMutation = useConvertIssueToTask();

  const displayCategory = category || initialCategory;

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  const handleConvertToTask = async () => {
    if (!proposal) return;

    const geography = formatProposalGeography(proposal);
    const locationId = proposal.censusBoundaryId || 'unknown';

    try {
      const taskId = await convertMutation.mutateAsync({
        title: proposal.instanceName,
        description: proposal.description,
        category: displayCategory || 'General',
        locationId,
        issueId: proposalName,
      });

      toast.success(uiCopy.issueProject.convertSuccess);

      // Navigate to the new task detail page
      const taskDetailPath = joinBasePath(`/tasks/${locationId}/${taskId.toString()}`);
      window.history.pushState({}, '', taskDetailPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
      onClose();
    } catch (error: any) {
      toast.error(error.message || uiCopy.issueProject.convertError);
    }
  };

  const handleTaskClick = (taskId: bigint, locationId: string) => {
    const taskDetailPath = joinBasePath(`/tasks/${locationId}/${taskId.toString()}`);
    window.history.pushState({}, '', taskDetailPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
    onClose();
  };

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

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {uiCopy.issueProject.relatedTasksTitle}
                  </h3>
                  <Button
                    onClick={handleConvertToTask}
                    disabled={convertMutation.isPending}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    {convertMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {uiCopy.issueProject.converting}
                      </>
                    ) : (
                      <>
                        {uiCopy.issueProject.convertButton}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                {tasksLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <LoadingIndicator label={uiCopy.issueProject.loadingRelatedTasks} />
                  </div>
                ) : tasksError ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-destructive text-center">
                        {uiCopy.issueProject.relatedTasksError}
                      </p>
                    </CardContent>
                  </Card>
                ) : !relatedTasks || relatedTasks.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground text-center">
                        {uiCopy.issueProject.noRelatedTasks}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {relatedTasks.map((task) => (
                      <Card
                        key={task.id.toString()}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleTaskClick(task.id, task.locationId)}
                      >
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm mb-1 truncate">{task.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant={getStatusBadgeVariant(task.status)} className="text-xs">
                                  {formatStatus(task.status)}
                                </Badge>
                                <span>•</span>
                                <span>
                                  {task.assignee
                                    ? task.assignee.toString().slice(0, 8) + '...'
                                    : uiCopy.issueProject.unassigned}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
