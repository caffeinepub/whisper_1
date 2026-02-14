import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Loader2, Send, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface PostComposerProps {
  instanceName?: string;
}

export function PostComposer({ instanceName: providedInstanceName }: PostComposerProps) {
  const [localInstanceName, setLocalInstanceName] = useState('');
  const [content, setContent] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { identity } = useInternetIdentity();
  const createPost = useCreatePost();

  const isAuthenticated = !!identity;
  const showInstanceInput = !providedInstanceName;
  const effectiveInstanceName = providedInstanceName || localInstanceName;

  // Reset form when instanceName prop changes (instance switching)
  useEffect(() => {
    if (providedInstanceName) {
      setContent('');
      setSelectedPhoto(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [providedInstanceName]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedPhoto(file);
  };

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

    if (!effectiveInstanceName.trim()) {
      toast.error('Instance name cannot be empty');
      return;
    }

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        instanceName: effectiveInstanceName.trim(),
      });

      // Clear form on success
      setContent('');
      setSelectedPhoto(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (showInstanceInput) {
        setLocalInstanceName('');
      }
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Create a Post
          {providedInstanceName && (
            <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Posting to current location
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showInstanceInput && (
            <div className="space-y-2">
              <Label htmlFor="instanceName">Instance Name</Label>
              <Input
                id="instanceName"
                placeholder="e.g., WHISPER-California"
                value={localInstanceName}
                onChange={(e) => setLocalInstanceName(e.target.value)}
                disabled={createPost.isPending || !isAuthenticated}
              />
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="photo">Photo (optional)</Label>
            <Input
              id="photo"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={createPost.isPending || !isAuthenticated}
            />
            <p className="text-xs text-muted-foreground">
              Photo upload will be enabled in a later step.
            </p>
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
