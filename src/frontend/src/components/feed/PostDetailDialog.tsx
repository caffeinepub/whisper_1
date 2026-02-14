import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { usePostDetail } from '@/hooks/usePostDetail';
import { useUserProfileByPrincipal } from '@/hooks/useUserProfileByPrincipal';
import { UserAvatar } from '@/components/common/UserAvatar';

interface PostDetailDialogProps {
  postId: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailDialog({ postId, open, onOpenChange }: PostDetailDialogProps) {
  const { data: post, isLoading, isError } = usePostDetail(open ? postId : null);
  const { data: authorProfile } = useUserProfileByPrincipal(post?.author || null);

  const authorName = authorProfile?.name || 'Anonymous';

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="font-semibold">Failed to load post</p>
          </div>
        )}

        {post && (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Post Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Author info */}
              <div className="flex items-start gap-3">
                <UserAvatar
                  imageBytes={authorProfile?.profileImage}
                  name={authorName}
                  className="h-12 w-12"
                  fallbackClassName="bg-secondary text-secondary-foreground"
                />
                <div className="flex-1">
                  <p className="font-semibold">{authorName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{post.instanceName}</Badge>
                    <span>•</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-foreground">{post.content}</p>
              </div>

              {/* Metadata */}
              {post.updatedAt && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {formatDate(post.updatedAt)}
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
