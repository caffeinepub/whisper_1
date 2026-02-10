import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2 } from 'lucide-react';
import { useGetTasks, useCreateTask, useUpdateTaskStatus } from '@/hooks/useIssueProjectTasks';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { toast } from 'sonner';

interface IssueProjectTasksTabProps {
  proposalId: string;
}

export function IssueProjectTasksTab({ proposalId }: IssueProjectTasksTabProps) {
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const { data: tasks, isLoading, error } = useGetTasks(proposalId);
  const createTaskMutation = useCreateTask();
  const updateTaskStatusMutation = useUpdateTaskStatus();

  const handleCreateTask = async () => {
    if (!newTaskDescription.trim()) {
      toast.error('Task description is required');
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        proposalId,
        description: newTaskDescription.trim(),
      });
      setNewTaskDescription('');
      toast.success('Task created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleToggleTask = async (taskId: bigint, currentCompleted: boolean) => {
    try {
      await updateTaskStatusMutation.mutateAsync({
        proposalId,
        taskId,
        completed: !currentCompleted,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingIndicator label="Loading tasks..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive mb-4">Failed to load tasks</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Task Form */}
      <div className="flex gap-2">
        <Input
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          placeholder="Enter task description..."
          disabled={createTaskMutation.isPending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleCreateTask();
            }
          }}
          className="flex-1"
        />
        <Button
          onClick={handleCreateTask}
          disabled={!newTaskDescription.trim() || createTaskMutation.isPending}
          className="bg-secondary hover:bg-secondary/90"
        >
          {createTaskMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </>
          )}
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {!tasks || tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No tasks yet. Create your first task above.
          </p>
        ) : (
          tasks.map(([taskId, task]) => {
            const isUpdating = updateTaskStatusMutation.isPending && updateTaskStatusMutation.variables?.taskId === taskId;
            
            return (
              <div
                key={taskId.toString()}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(taskId, task.completed)}
                  disabled={isUpdating}
                  className="shrink-0"
                />
                <span
                  className={`flex-1 ${
                    task.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {task.description}
                </span>
                {isUpdating && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
