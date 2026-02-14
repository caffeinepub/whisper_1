import { useState } from 'react';
import { PageLayout } from '@/components/common/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock } from 'lucide-react';
import { useGetTask, useUpdateTaskStatus, useSelfAssignTask, useAdminAssignTask } from '@/hooks/useTasks';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { TaskStatus } from '@/backend';
import { joinBasePath } from '@/utils/assetUrl';
import { parseTasksRoute } from '@/utils/tasksRoute';

export default function TaskDetailPage() {
  const { locationId, taskId } = parseTasksRoute();
  const { data: task, isLoading } = useGetTask(locationId || 'default', taskId || '0');
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateTaskStatus();
  const { mutate: selfAssign, isPending: isAssigning } = useSelfAssignTask();
  const { mutate: adminAssign, isPending: isAdminAssigning } = useAdminAssignTask();
  const { data: isAdmin } = useIsAdmin();
  const { identity } = useInternetIdentity();
  const [assigneePrincipal, setAssigneePrincipal] = useState('');

  const handleNavigate = (path: string) => {
    const fullPath = joinBasePath(path);
    window.history.pushState({}, '', fullPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!task) return;
    updateStatus({
      taskId: task.id,
      locationId: task.locationId,
      title: task.title,
      description: task.description,
      category: task.category,
      status: newStatus,
    });
  };

  const handleSelfAssign = () => {
    if (!task) return;
    selfAssign({
      taskId: task.id,
      locationId: task.locationId,
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
    });
  };

  const handleAdminAssign = () => {
    if (!task || !assigneePrincipal.trim()) return;
    adminAssign({
      taskId: task.id,
      locationId: task.locationId,
      assigneePrincipal: assigneePrincipal.trim(),
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
    });
  };

  const getStatusBadgeVariant = (status: TaskStatus) => {
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
  };

  const getStatusLabel = (status: TaskStatus) => {
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
        return 'Unknown';
    }
  };

  const isAssignedToMe = task?.assignee?.toString() === identity?.getPrincipal().toString();

  return (
    <PageLayout showBack backTo={`/tasks/${locationId}`}>
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : task ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription className="mt-2">{task.description}</CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(task.status)}>
                    {getStatusLabel(task.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="font-medium">{task.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Location ID</div>
                    <div className="font-medium truncate">{task.locationId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Assignee</div>
                    <div className="font-medium">
                      {task.assignee ? task.assignee.toString().slice(0, 10) + '...' : 'Unassigned'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Created</div>
                    <div className="font-medium">
                      {new Date(Number(task.createdAt) / 1000000).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.status === TaskStatus.open && (
                      <Button
                        onClick={() => handleStatusChange(TaskStatus.in_progress)}
                        disabled={isUpdating}
                        size="sm"
                      >
                        Start Progress
                      </Button>
                    )}
                    {task.status === TaskStatus.in_progress && (
                      <>
                        <Button
                          onClick={() => handleStatusChange(TaskStatus.blocked)}
                          disabled={isUpdating}
                          variant="destructive"
                          size="sm"
                        >
                          Mark Blocked
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(TaskStatus.resolved)}
                          disabled={isUpdating}
                          variant="outline"
                          size="sm"
                        >
                          Mark Resolved
                        </Button>
                      </>
                    )}
                    {task.status === TaskStatus.blocked && (
                      <Button
                        onClick={() => handleStatusChange(TaskStatus.in_progress)}
                        disabled={isUpdating}
                        size="sm"
                      >
                        Resume Progress
                      </Button>
                    )}
                    {!task.assignee && (
                      <Button
                        onClick={handleSelfAssign}
                        disabled={isAssigning}
                        variant="secondary"
                        size="sm"
                      >
                        Assign to Me
                      </Button>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Admin Actions</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Principal ID"
                        value={assigneePrincipal}
                        onChange={(e) => setAssigneePrincipal(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                      />
                      <Button
                        onClick={handleAdminAssign}
                        disabled={isAdminAssigning || !assigneePrincipal.trim()}
                        size="sm"
                      >
                        Assign
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
                <CardDescription>Task status changes and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {task.history.map((entry, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(entry.status)} className="text-xs">
                            {getStatusLabel(entry.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(Number(entry.timestamp) / 1000000).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{entry.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Task not found
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
