import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, CheckCircle2, Circle } from 'lucide-react';
import { IconBubble } from '@/components/common/IconBubble';
import { useGetTasks, useCreateTask, useUpdateTaskStatus } from '@/hooks/useIssueProjectTasks';
import { toast } from 'sonner';

interface IssueProjectTasksTabProps {
  proposalId: string;
}

export function IssueProjectTasksTab({ proposalId }: IssueProjectTasksTabProps) {
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const { data: tasks, isLoading, error } = useGetTasks(proposalId);
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTaskStatus, isPending: isUpdating } = useUpdateTaskStatus();

  const handleCreateTask = () => {
    if (!newTaskDescription.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    createTask(
      { proposalId, description: newTaskDescription },
      {
        onSuccess: () => {
          setNewTaskDescription('');
          toast.success('Task created successfully');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to create task');
        },
      }
    );
  };

  const handleToggleTask = (taskId: bigint, currentCompleted: boolean) => {
    updateTaskStatus(
      { proposalId, taskId, completed: !currentCompleted },
      {
        onError: (error: any) => {
          toast.error(error.message || 'Failed to update task');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <IconBubble size="lg" variant="warning">
          <Circle className="h-6 w-6" />
        </IconBubble>
        <p className="text-white/70 mt-4">Failed to load tasks</p>
      </div>
    );
  }

  const taskList = tasks || [];

  return (
    <div className="space-y-6">
      {/* Add New Task */}
      <div className="space-y-3">
        <Label htmlFor="new-task" className="text-white font-semibold">
          Add New Task
        </Label>
        <div className="flex gap-2">
          <Input
            id="new-task"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Enter task description..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-secondary"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isCreating) {
                handleCreateTask();
              }
            }}
            disabled={isCreating}
          />
          <Button
            onClick={handleCreateTask}
            disabled={isCreating || !newTaskDescription.trim()}
            className="bg-secondary hover:bg-secondary/90 text-white font-semibold"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Task List */}
      <div className="space-y-3">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <IconBubble size="sm" variant="secondary">
            <CheckCircle2 className="h-4 w-4" />
          </IconBubble>
          Tasks ({taskList.length})
        </h4>

        {taskList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60">No tasks yet. Add your first task above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {taskList.map(([taskId, task]) => (
              <div
                key={taskId.toString()}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-secondary/30 transition-colors"
              >
                <Checkbox
                  id={`task-${taskId}`}
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(taskId, task.completed)}
                  disabled={isUpdating}
                  className="border-white/30 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                />
                <Label
                  htmlFor={`task-${taskId}`}
                  className={`flex-1 cursor-pointer text-white ${
                    task.completed ? 'line-through text-white/50' : ''
                  }`}
                >
                  {task.description}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
