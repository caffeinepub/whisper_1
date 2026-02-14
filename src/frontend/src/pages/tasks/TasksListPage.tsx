import { PageLayout } from '@/components/common/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus } from 'lucide-react';
import { useListTasksByLocation } from '@/hooks/useTasks';
import { TaskStatus } from '@/backend';
import { joinBasePath } from '@/utils/assetUrl';
import { parseTasksRoute } from '@/utils/tasksRoute';
import { uiCopy } from '@/lib/uiCopy';

export default function TasksListPage() {
  const { locationId } = parseTasksRoute();
  const { data: tasks, isLoading } = useListTasksByLocation(locationId || 'default');

  const handleNavigate = (path: string) => {
    const fullPath = joinBasePath(path);
    window.history.pushState({}, '', fullPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
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

  return (
    <PageLayout showBack backTo="/">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{uiCopy.tasks.listTitle}</CardTitle>
                <CardDescription>Manage civic tasks for this location</CardDescription>
              </div>
              <Button onClick={() => handleNavigate(`/tasks/${locationId}/new`)}>
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
            ) : tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id.toString()}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleNavigate(`/tasks/${locationId}/${task.id}`)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getStatusBadgeVariant(task.status)} className="text-xs">
                          {getStatusLabel(task.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{task.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found for this location. Create one to get started!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
