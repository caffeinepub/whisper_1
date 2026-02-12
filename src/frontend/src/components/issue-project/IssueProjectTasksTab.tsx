import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateTask, useGetTasks, useUpdateTaskStatus } from '@/hooks/useIssueProjectTasks';
import { useContributionEventLogger } from '@/hooks/useContributionEventLogger';
import { CONTRIBUTION_ACTION_TYPES } from '@/lib/contributionActionTypes';
import { showEarnedPointsToast } from '@/lib/earnedPointsToast';

interface IssueProjectTasksTabProps {
  proposalId: string;
}

export function IssueProjectTasksTab({ proposalId }: IssueProjectTasksTabProps) {
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [contributionError, setContributionError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading, error } = useGetTasks(proposalId);
  const createTask = useCreateTask(proposalId);
  const updateTaskStatus = useUpdateTaskStatus(proposalId);
  const logContribution = useContributionEventLogger();

  const handleAddTask = async () => {
    if (!newTaskDescription.trim()) return;

    // Clear any previous contribution errors
    setContributionError(null);

    try {
      const result = await createTask.mutateAsync(newTaskDescription);
      setNewTaskDescription('');

      // Log contribution event after successful comment/task creation
      try {
        const contributionResult = await logContribution.mutateAsync({
          actionType: CONTRIBUTION_ACTION_TYPES.COMMENT_CREATED,
          referenceId: result.taskId.toString(),
          details: 'Task/comment created',
        });

        // Show earned-points toast immediately if not a duplicate
        if (!contributionResult.isDuplicate) {
          showEarnedPointsToast({
            pointsAwarded: contributionResult.pointsAwarded,
            actionType: contributionResult.actionType,
            origin: 'standard',
            queryClient,
          });
        }
      } catch (error: any) {
        // Don't block the success flow, but show inline message
        const errorMessage = error?.message || 'Could not record contribution points.';
        setContributionError(errorMessage);
        console.warn('Failed to log contribution for task creation:', error);
      }
    } catch (error: any) {
      console.error('Failed to create task:', error);
    }
  };

  const handleToggleTask = (taskId: bigint, currentStatus: boolean) => {
    updateTaskStatus.mutate({ taskId, completed: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Add a new task..."
            disabled={createTask.isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !createTask.isPending) {
                handleAddTask();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleAddTask}
            disabled={!newTaskDescription.trim() || createTask.isPending}
            size="icon"
            className="shrink-0"
          >
            {createTask.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {contributionError && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-warning">{contributionError}</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tasks yet. Add one to get started!
          </p>
        ) : (
          tasks.map((task) => {
            const isUpdating = updateTaskStatus.isPending;
            
            return (
              <div
                key={task.id.toString()}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  task.completed
                    ? 'bg-muted/50 border-muted'
                    : 'bg-card border-border hover:bg-accent/5'
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                  disabled={isUpdating}
                  className="mt-0.5 shrink-0"
                />
                <p
                  className={`text-sm flex-1 ${
                    task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {task.description}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
