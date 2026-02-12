import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateTask } from '@/hooks/useTasks';
import { joinBasePath } from '@/utils/assetUrl';
import { uiCopy } from '@/lib/uiCopy';
import { toast } from 'sonner';

interface TaskCreatePageProps {
  locationId: string;
}

export default function TaskCreatePage({ locationId }: TaskCreatePageProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [issueId, setIssueId] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string; category?: string }>({});

  const createTaskMutation = useCreateTask();

  const handleBack = () => {
    const listPath = joinBasePath(`/tasks/${locationId}`);
    window.history.pushState({}, '', listPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string; description?: string; category?: string } = {};

    if (!title.trim()) {
      newErrors.title = uiCopy.tasks.titleRequired;
    }

    if (!description.trim()) {
      newErrors.description = uiCopy.tasks.descriptionRequired;
    }

    if (!category.trim()) {
      newErrors.category = uiCopy.tasks.categoryRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const taskId = await createTaskMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        locationId,
        issueId: issueId.trim() || null,
      });

      toast.success(uiCopy.tasks.createSuccess);

      // Navigate to the newly created task detail page
      const detailPath = joinBasePath(`/tasks/${locationId}/${taskId.toString()}`);
      window.history.pushState({}, '', detailPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error: any) {
      toast.error(error.message || uiCopy.tasks.createError);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={handleBack} className="gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" />
          {uiCopy.tasks.backToList}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{uiCopy.tasks.createTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{uiCopy.tasks.createDescription}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {uiCopy.tasks.titleLabel} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors({ ...errors, title: undefined });
                  }}
                  placeholder={uiCopy.tasks.titlePlaceholder}
                  disabled={createTaskMutation.isPending}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  {uiCopy.tasks.descriptionLabel} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors({ ...errors, description: undefined });
                  }}
                  placeholder={uiCopy.tasks.descriptionPlaceholder}
                  rows={5}
                  disabled={createTaskMutation.isPending}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  {uiCopy.tasks.categoryLabel} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (errors.category) setErrors({ ...errors, category: undefined });
                  }}
                  placeholder={uiCopy.tasks.categoryPlaceholder}
                  disabled={createTaskMutation.isPending}
                />
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueId">{uiCopy.tasks.issueIdLabel}</Label>
                <Input
                  id="issueId"
                  value={issueId}
                  onChange={(e) => setIssueId(e.target.value)}
                  placeholder={uiCopy.tasks.issueIdPlaceholder}
                  disabled={createTaskMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">{uiCopy.tasks.issueIdHelp}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={createTaskMutation.isPending} className="flex-1">
                  {createTaskMutation.isPending ? uiCopy.tasks.creating : uiCopy.tasks.createButton}
                </Button>
                <Button type="button" variant="outline" onClick={handleBack} disabled={createTaskMutation.isPending}>
                  {uiCopy.tasks.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
