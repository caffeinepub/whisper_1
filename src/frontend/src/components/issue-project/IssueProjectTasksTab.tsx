import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Loader2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetTasks, useCreateTask, useUpdateTaskStatus } from '@/hooks/useIssueProjectTasks';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useContributionEventLogger, type ContributionLogResult } from '@/hooks/useContributionEventLogger';
import { CONTRIBUTION_ACTION_TYPES } from '@/lib/contributionActionTypes';
import { showEarnedPointsToast } from '@/lib/earnedPointsToast';
import { EarnedPointsInlineBadge } from '@/components/common/EarnedPointsInlineBadge';

interface IssueProjectTasksTabProps {
  proposalId: string;
  origin?: 'standard' | 'chat';
}

export function IssueProjectTasksTab({ proposalId, origin = 'standard' }: IssueProjectTasksTabProps) {
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [contributionError, setContributionError] = useState<string | null>(null);
  const [contributionResult, setContributionResult] = useState<ContributionLogResult | null>(null);

  const queryClient = useQueryClient();
  const { data: tasks, isLoading, isError, error } = useGetTasks(proposalId);
  const createTask = useCreateTask(proposalId);
  const updateTaskStatus = useUpdateTaskStatus(proposalId);
  const logContribution = useContributionEventLogger();

  const handleCreateTask = () => {
    if (!newTaskDescription.trim()) return;

    setContributionError(null);
    setContributionResult(null);

    createTask.mutate(
      newTaskDescription,
      {
        onSuccess: (data) => {
          // Log contribution event with stable non-empty referenceId
          const referenceId = `${proposalId}-task-${data.taskId}`;

          logContribution.mutate(
            {
              actionType: CONTRIBUTION_ACTION_TYPES.COMMENT_CREATED,
              referenceId,
              details: newTaskDescription,
            },
            {
              onSuccess: (result) => {
                setContributionResult(result);

                // Show toast only for non-duplicates
                if (!result.isDuplicate) {
                  showEarnedPointsToast({
                    pointsAwarded: result.pointsAwarded,
                    actionType: result.actionType,
                    origin,
                    queryClient,
                  });
                }

                // Clear input
                setNewTaskDescription('');
              },
              onError: (error) => {
                // Non-blocking: show inline error but don't prevent task creation
                setContributionError(error.message);
                console.error('Contribution logging failed (non-blocking):', error);

                // Still clear input
                setNewTaskDescription('');
              },
            }
          );
        },
      }
    );
  };

  const handleToggleTask = (taskId: bigint, currentStatus: boolean) => {
    updateTaskStatus.mutate({
      taskId,
      completed: !currentStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingIndicator label="Loading tasks..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive py-4">
        <AlertCircle className="h-4 w-4" />
        <span>{error?.message || 'Failed to load tasks'}</span>
      </div>
    );
  }

  const sortedTasks = tasks ? [...tasks].sort((a, b) => Number(a.id) - Number(b.id)) : [];

  return (
    <div className="space-y-6">
      {/* Create Task Section */}
      <div className="space-y-3">
        <Label htmlFor="new-task-input">Add a new task</Label>
        <div className="flex gap-2">
          <Input
            id="new-task-input"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Describe the task..."
            disabled={createTask.isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCreateTask();
              }
            }}
          />
          <Button
            onClick={handleCreateTask}
            disabled={createTask.isPending || !newTaskDescription.trim()}
            size="icon"
          >
            {createTask.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Contribution Error (non-blocking) */}
        {contributionError && (
          <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Note: {contributionError}</span>
          </div>
        )}

        {/* Earned Points Badge */}
        <EarnedPointsInlineBadge result={contributionResult} />
      </div>

      <Separator />

      {/* Tasks List */}
      <div className="space-y-2">
        <Label>Tasks ({sortedTasks.length})</Label>
        {sortedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No tasks yet. Add one above to get started.</p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {sortedTasks.map((task) => {
                const isUpdating = updateTaskStatus.isPending;
                return (
                  <div
                    key={Number(task.id)}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                      disabled={isUpdating}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`text-sm cursor-pointer ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.description}
                      </label>
                    </div>
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
