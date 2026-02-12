import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useListTasksByLocation } from '@/hooks/useTasks';
import { joinBasePath } from '@/utils/assetUrl';
import { setLastUsedLocationId } from '@/utils/instanceScope';
import { uiCopy } from '@/lib/uiCopy';
import { useEffect } from 'react';
import type { TaskStatus } from '@/backend';

interface TasksListPageProps {
  locationId: string;
}

function getStatusBadgeVariant(status: TaskStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'open':
      return 'default';
    case 'in_progress':
      return 'secondary';
    case 'blocked':
      return 'destructive';
    case 'resolved':
      return 'outline';
    default:
      return 'default';
  }
}

function formatStatus(status: TaskStatus): string {
  switch (status) {
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'blocked':
      return 'Blocked';
    case 'resolved':
      return 'Resolved';
    default:
      return status;
  }
}

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TasksListPage({ locationId }: TasksListPageProps) {
  const { data: tasks, isLoading, error } = useListTasksByLocation(locationId);

  useEffect(() => {
    setLastUsedLocationId(locationId);
  }, [locationId]);

  const handleBack = () => {
    const homePath = joinBasePath('/');
    window.history.pushState({}, '', homePath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCreateTask = () => {
    const createPath = joinBasePath(`/tasks/${locationId}/new`);
    window.history.pushState({}, '', createPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleTaskClick = (taskId: bigint) => {
    const detailPath = joinBasePath(`/tasks/${locationId}/${taskId.toString()}`);
    window.history.pushState({}, '', detailPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {uiCopy.tasks.backToHome}
          </Button>
          <Button onClick={handleCreateTask} className="gap-2">
            <Plus className="h-4 w-4" />
            {uiCopy.tasks.createTask}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{uiCopy.tasks.listTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {uiCopy.tasks.listDescription} {locationId}
            </p>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center py-8">
                <LoadingIndicator label={uiCopy.tasks.loadingTasks} />
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-destructive">{error.message}</p>
              </div>
            )}

            {!isLoading && !error && tasks && tasks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{uiCopy.tasks.emptyState}</p>
              </div>
            )}

            {!isLoading && !error && tasks && tasks.length > 0 && (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <button
                    key={task.id.toString()}
                    onClick={() => handleTaskClick(task.id)}
                    className="w-full text-left p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 truncate">{task.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{uiCopy.tasks.category}: {task.category}</span>
                          <span>•</span>
                          <span>
                            {uiCopy.tasks.assignee}:{' '}
                            {task.assignee ? task.assignee.toString().slice(0, 8) + '...' : uiCopy.tasks.unassigned}
                          </span>
                          <span>•</span>
                          <span>{formatTimestamp(task.createdAt)}</span>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(task.status)}>{formatStatus(task.status)}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
