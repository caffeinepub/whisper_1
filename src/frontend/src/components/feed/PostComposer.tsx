import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export function PostComposer() {
  const [instanceName, setInstanceName] = useState('');
  const [content, setContent] = useState('');
  const { identity } = useInternetIdentity();
  const createPost = useCreatePost();

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to create a post');
      return;
    }

    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    if (!instanceName.trim()) {
      toast.error('Instance name cannot be empty');
      return;
    }

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        instanceName: instanceName.trim(),
      });

      // Clear form on success
      setContent('');
      setInstanceName('');
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg">Create a Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName">Instance Name</Label>
            <Input
              id="instanceName"
              placeholder="e.g., WHISPER-California"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              disabled={createPost.isPending || !isAuthenticated}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={createPost.isPending || !isAuthenticated}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={createPost.isPending || !isAuthenticated}
            className="w-full"
          >
            {createPost.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post
              </>
            )}
          </Button>

          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground text-center">
              Please log in to create posts
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
