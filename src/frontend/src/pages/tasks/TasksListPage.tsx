import { HomeHeader } from '@/components/common/HomeHeader';
import { BackNav } from '@/components/common/BackNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus } from 'lucide-react';
import { useListTasksByLocation } from '@/hooks/useTasks';
import { joinBasePath } from '@/utils/assetUrl';
import { uiCopy } from '@/lib/uiCopy';
import { TaskStatus } from '@/backend';

interface TasksListPageProps {
  locationId: string;
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

export default function TasksListPage({ locationId }: TasksListPageProps) {
  const { data: tasks, isLoading, error } = useListTasksByLocation(locationId);

  const handleNavigateToTask = (taskId: bigint) => {
    const taskPath = joinBasePath(`/tasks/${locationId}/${taskId}`);
    window.history.pushState({}, '', taskPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCreateTask = () => {
    const createPath = joinBasePath(`/tasks/${locationId}/new`);
    window.history.pushState({}, '', createPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <BackNav to="/" />
        
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>{uiCopy.tasks.listDescription} {locationId}</CardDescription>
                </div>
                <Button onClick={handleCreateTask} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {uiCopy.tasks.createTask}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-destructive">Error loading tasks</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {error instanceof Error ? error.message : 'Failed to load tasks'}
                  </p>
                </div>
              ) : !tasks || tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{uiCopy.tasks.emptyState}</p>
                  <Button onClick={handleCreateTask} variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    {uiCopy.tasks.createTask}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id.toString()}
                      onClick={() => handleNavigateToTask(task.id)}
                      className="w-full text-left p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{task.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                            {task.assignee && (
                              <span className="text-xs text-muted-foreground">
                                Assigned to {task.assignee.toString().slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={statusVariants[task.status]}>
                          {statusLabels[task.status]}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
