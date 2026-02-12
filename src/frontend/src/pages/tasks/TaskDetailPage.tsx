import { useState } from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useGetTask, useUpdateTaskStatus, useSelfAssignTask, useAdminAssignTask } from '@/hooks/useTasks';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { joinBasePath } from '@/utils/assetUrl';
import { uiCopy } from '@/lib/uiCopy';
import { toast } from 'sonner';
import { TaskStatus } from '@/backend';
import { Principal } from '@dfinity/principal';

interface TaskDetailPageProps {
  locationId: string;
  taskId: string;
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

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function TaskDetailPage({ locationId, taskId }: TaskDetailPageProps) {
  const { data: task, isLoading, error } = useGetTask(locationId, taskId);
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const updateStatusMutation = useUpdateTaskStatus();
  const selfAssignMutation = useSelfAssignTask();
  const adminAssignMutation = useAdminAssignTask();
  const [assigneePrincipal, setAssigneePrincipal] = useState('');

  const isAuthenticated = !!identity;

  const handleBack = () => {
    const listPath = joinBasePath(`/tasks/${locationId}`);
    window.history.pushState({}, '', listPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;

    try {
      await updateStatusMutation.mutateAsync({
        taskId: task.id,
        locationId,
        status: newStatus,
        title: task.title,
        description: task.description,
        category: task.category,
      });
      toast.success(uiCopy.tasks.statusUpdated);
    } catch (error: any) {
      toast.error(error.message || uiCopy.tasks.statusUpdateError);
    }
  };

  const handleSelfAssign = async () => {
    if (!task) return;

    try {
      await selfAssignMutation.mutateAsync({
        taskId: task.id,
        locationId,
        title: task.title,
        description: task.description,
        category: task.category,
        status: task.status,
      });
      toast.success(uiCopy.tasks.selfAssignSuccess);
    } catch (error: any) {
      toast.error(error.message || uiCopy.tasks.assignError);
    }
  };

  const handleAdminAssign = async () => {
    if (!task || !assigneePrincipal.trim()) {
      toast.error(uiCopy.tasks.principalRequired);
      return;
    }

    try {
      Principal.fromText(assigneePrincipal.trim());
    } catch {
      toast.error(uiCopy.tasks.invalidPrincipal);
      return;
    }

    try {
      await adminAssignMutation.mutateAsync({
        taskId: task.id,
        locationId,
        assigneePrincipal: assigneePrincipal.trim(),
        title: task.title,
        description: task.description,
        category: task.category,
        status: task.status,
      });
      toast.success(uiCopy.tasks.adminAssignSuccess);
      setAssigneePrincipal('');
    } catch (error: any) {
      toast.error(error.message || uiCopy.tasks.assignError);
    }
  };

  const getValidTransitions = (currentStatus: TaskStatus): TaskStatus[] => {
    switch (currentStatus) {
      case TaskStatus.open:
        return [TaskStatus.in_progress, TaskStatus.blocked];
      case TaskStatus.in_progress:
        return [TaskStatus.blocked, TaskStatus.resolved];
      case TaskStatus.blocked:
        return [TaskStatus.open, TaskStatus.in_progress];
      case TaskStatus.resolved:
        return [];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <LoadingIndicator label={uiCopy.tasks.loadingTask} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={handleBack} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            {uiCopy.tasks.backToList}
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive text-center">{error.message}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={handleBack} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            {uiCopy.tasks.backToList}
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">{uiCopy.tasks.taskNotFound}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const validTransitions = getValidTransitions(task.status);
  const isPending = updateStatusMutation.isPending || selfAssignMutation.isPending || adminAssignMutation.isPending;

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={handleBack} className="gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" />
          {uiCopy.tasks.backToList}
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{uiCopy.tasks.category}: {task.category}</span>
                  {task.issueId && (
                    <>
                      <span>•</span>
                      <span>{uiCopy.tasks.linkedIssue}: {task.issueId}</span>
                    </>
                  )}
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(task.status)} className="text-sm">
                {formatStatus(task.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">{uiCopy.tasks.description}</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">{uiCopy.tasks.assignee}</h3>
              <p className="text-muted-foreground">
                {task.assignee ? task.assignee.toString() : uiCopy.tasks.unassigned}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">{uiCopy.tasks.statusTransitions}</h3>
              {validTransitions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {validTransitions.map((status) => (
                    <Button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={isPending}
                      variant="outline"
                      size="sm"
                    >
                      {uiCopy.tasks.moveTo} {formatStatus(status)}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{uiCopy.tasks.noTransitions}</p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">{uiCopy.tasks.assignmentControls}</h3>
              {!isAuthenticated ? (
                <p className="text-sm text-muted-foreground">{uiCopy.tasks.loginToAssign}</p>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={handleSelfAssign}
                    disabled={isPending}
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                  >
                    <User className="h-4 w-4" />
                    {uiCopy.tasks.selfAssign}
                  </Button>

                  {isAdmin && (
                    <div className="space-y-2">
                      <Label htmlFor="assignee-principal">{uiCopy.tasks.adminAssignLabel}</Label>
                      <div className="flex gap-2">
                        <Input
                          id="assignee-principal"
                          value={assigneePrincipal}
                          onChange={(e) => setAssigneePrincipal(e.target.value)}
                          placeholder={uiCopy.tasks.principalPlaceholder}
                          disabled={isPending}
                        />
                        <Button onClick={handleAdminAssign} disabled={isPending} size="sm">
                          {uiCopy.tasks.assign}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">{uiCopy.tasks.history}</h3>
              {task.history && task.history.length > 0 ? (
                <div className="space-y-3">
                  {[...task.history].reverse().map((entry, index) => (
                    <div key={index} className="border-l-2 border-muted pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getStatusBadgeVariant(entry.status)} className="text-xs">
                          {formatStatus(entry.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{uiCopy.tasks.noHistory}</p>
              )}
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                {uiCopy.tasks.created}: {formatTimestamp(task.createdAt)}
              </p>
              <p>
                {uiCopy.tasks.updated}: {formatTimestamp(task.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
