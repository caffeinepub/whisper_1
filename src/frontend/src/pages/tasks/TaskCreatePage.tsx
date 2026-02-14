import { useState } from 'react';
import { PageLayout } from '@/components/common/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateTask } from '@/hooks/useTasks';
import { joinBasePath } from '@/utils/assetUrl';
import { parseTasksRoute } from '@/utils/tasksRoute';
import { uiCopy } from '@/lib/uiCopy';

export default function TaskCreatePage() {
  const { locationId } = parseTasksRoute();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const { mutate: createTask, isPending } = useCreateTask();

  const handleNavigate = (path: string) => {
    const fullPath = joinBasePath(path);
    window.history.pushState({}, '', fullPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId) return;

    createTask(
      {
        title,
        description,
        category: category || 'General',
        locationId,
        issueId: null,
      },
      {
        onSuccess: () => {
          handleNavigate(`/tasks/${locationId}`);
        },
      }
    );
  };

  const handleCancel = () => {
    handleNavigate(`/tasks/${locationId}`);
  };

  return (
    <PageLayout showBack backTo={`/tasks/${locationId}`}>
      <Card>
        <CardHeader>
          <CardTitle>{uiCopy.tasks.createTask}</CardTitle>
          <CardDescription>Create a new civic task for this location</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Infrastructure, Safety, Environment"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Task'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
