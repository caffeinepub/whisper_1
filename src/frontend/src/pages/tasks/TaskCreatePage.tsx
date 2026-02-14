import { useState } from 'react';
import { HomeHeader } from '@/components/common/HomeHeader';
import { BackNav } from '@/components/common/BackNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCreateTask } from '@/hooks/useTasks';
import { joinBasePath } from '@/utils/assetUrl';
import { uiCopy } from '@/lib/uiCopy';

interface TaskCreatePageProps {
  locationId: string;
}

export default function TaskCreatePage({ locationId }: TaskCreatePageProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const { mutate: createTask, isPending } = useCreateTask();

  const handleBackToList = () => {
    const listPath = joinBasePath(`/tasks/${locationId}`);
    window.history.pushState({}, '', listPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !category.trim()) {
      return;
    }

    createTask(
      {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        locationId,
        issueId: null,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === 'success') {
            const taskId = result.success.taskId;
            const detailPath = joinBasePath(`/tasks/${locationId}/${taskId}`);
            window.history.pushState({}, '', detailPath);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        },
      }
    );
  };

  const isFormValid = title.trim() && description.trim() && category.trim();

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <BackNav onClick={handleBackToList} label="Back to Tasks" />
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{uiCopy.tasks.createTask}</CardTitle>
              <CardDescription>{uiCopy.tasks.createDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{uiCopy.tasks.titleLabel}</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={uiCopy.tasks.titlePlaceholder}
                    disabled={isPending}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{uiCopy.tasks.descriptionLabel}</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={uiCopy.tasks.descriptionPlaceholder}
                    disabled={isPending}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{uiCopy.tasks.categoryLabel}</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={uiCopy.tasks.categoryPlaceholder}
                    disabled={isPending}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={!isFormValid || isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      uiCopy.tasks.createTask
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleBackToList} disabled={isPending}>
                    {uiCopy.common.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
