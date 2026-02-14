import { useState } from 'react';
import { HomeHeader } from '@/components/common/HomeHeader';
import { BackNav } from '@/components/common/BackNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useGetTask, useUpdateTaskStatus, useSelfAssignTask, useAdminAssignTask } from '@/hooks/useTasks';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { TaskStatus } from '@/backend';
import { uiCopy } from '@/lib/uiCopy';
import { joinBasePath } from '@/utils/assetUrl';

interface TaskDetailPageProps {
  locationId: string;
  taskId: string;
}

const statusVariants: Record<TaskStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [TaskStatus.open]: 'default',
  [TaskStatus.in_progress]: 'secondary',
  [TaskStatus.blocked]: 'destructive',
  [TaskStatus.resolved]: 'outline',
};

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.open]: 'Open',
  [TaskStatus.in_progress]: 'In Progress',
  [TaskStatus.blocked]: 'Blocked',
  [TaskStatus.resolved]: 'Resolved',
};

export default function TaskDetailPage({ locationId, taskId }: TaskDetailPageProps) {
  const { data: task, isLoading, error } = useGetTask(locationId, taskId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateTaskStatus();
  const { mutate: selfAssign, isPending: isSelfAssigning } = useSelfAssignTask();
  const { mutate: adminAssign, isPending: isAdminAssigning } = useAdminAssignTask();
  const { data: isAdmin } = useIsAdmin();
  const { identity } = useInternetIdentity();

  const [assigneePrincipal, setAssigneePrincipal] = useState('');

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!task) return;
    updateStatus({
      taskId: task.id,
      locationId,
      status: newStatus,
      title: task.title,
      description: task.description,
      category: task.category,
    });
  };

  const handleSelfAssign = () => {
    if (!task) return;
    selfAssign({
      taskId: task.id,
      locationId,
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
    });
  };

  const handleAdminAssign = () => {
    if (!task || !assigneePrincipal.trim()) return;
    try {
      const principal = Principal.fromText(assigneePrincipal.trim());
      adminAssign({
        taskId: task.id,
        locationId,
        assigneePrincipal: assigneePrincipal.trim(),
        title: task.title,
        description: task.description,
        category: task.category,
        status: task.status,
      });
      setAssigneePrincipal('');
    } catch (err) {
      console.error('Invalid principal:', err);
    }
  };

  const handleBackToList = () => {
    const listPath = joinBasePath(`/tasks/${locationId}`);
    window.history.pushState({}, '', listPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const isAssignedToMe = task?.assignee && identity && task.assignee.toString() === identity.getPrincipal().toString();

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <BackNav onClick={handleBackToList} label="Back to Tasks" />
        
        <div className="mt-6 space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-destructive">Error loading task</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {error instanceof Error ? error.message : 'Failed to load task'}
                </p>
              </CardContent>
            </Card>
          ) : !task ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">{uiCopy.tasks.taskNotFound}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle>{task.title}</CardTitle>
                      <CardDescription className="mt-2">{task.description}</CardDescription>
                    </div>
                    <Badge variant={statusVariants[task.status]}>
                      {statusLabels[task.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{uiCopy.tasks.category}</p>
                      <p className="text-sm">{task.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{uiCopy.tasks.assignee}</p>
                      <p className="text-sm">
                        {task.assignee ? `${task.assignee.toString().slice(0, 12)}...` : uiCopy.tasks.unassigned}
                      </p>
                    </div>
                  </div>

                  {!task.assignee && (
                    <Button onClick={handleSelfAssign} disabled={isSelfAssigning} variant="outline" size="sm">
                      {isSelfAssigning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Assign to Me'
                      )}
                    </Button>
                  )}

                  {isAdmin && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="assignee">Admin Assign</Label>
                      <div className="flex gap-2">
                        <Input
                          id="assignee"
                          value={assigneePrincipal}
                          onChange={(e) => setAssigneePrincipal(e.target.value)}
                          placeholder="Principal ID"
                          disabled={isAdminAssigning}
                        />
                        <Button
                          onClick={handleAdminAssign}
                          disabled={!assigneePrincipal.trim() || isAdminAssigning}
                          size="sm"
                        >
                          {isAdminAssigning ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Assign'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {(isAssignedToMe || isAdmin) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Update Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleStatusChange(TaskStatus.open)}
                        disabled={isUpdating || task.status === TaskStatus.open}
                        variant={task.status === TaskStatus.open ? 'default' : 'outline'}
                        size="sm"
                      >
                        {statusLabels[TaskStatus.open]}
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(TaskStatus.in_progress)}
                        disabled={isUpdating || task.status === TaskStatus.in_progress}
                        variant={task.status === TaskStatus.in_progress ? 'secondary' : 'outline'}
                        size="sm"
                      >
                        {statusLabels[TaskStatus.in_progress]}
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(TaskStatus.blocked)}
                        disabled={isUpdating || task.status === TaskStatus.blocked}
                        variant={task.status === TaskStatus.blocked ? 'destructive' : 'outline'}
                        size="sm"
                      >
                        {statusLabels[TaskStatus.blocked]}
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(TaskStatus.resolved)}
                        disabled={isUpdating || task.status === TaskStatus.resolved}
                        variant={task.status === TaskStatus.resolved ? 'outline' : 'outline'}
                        size="sm"
                      >
                        {statusLabels[TaskStatus.resolved]}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>{uiCopy.tasks.history}</CardTitle>
                </CardHeader>
                <CardContent>
                  {task.history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{uiCopy.tasks.noHistory}</p>
                  ) : (
                    <div className="space-y-3">
                      {[...task.history].reverse().map((entry, index) => (
                        <div key={index} className="flex gap-3 text-sm">
                          <Badge variant={statusVariants[entry.status]} className="shrink-0">
                            {statusLabels[entry.status]}
                          </Badge>
                          <div className="flex-1">
                            <p>{entry.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(Number(entry.timestamp) / 1000000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
