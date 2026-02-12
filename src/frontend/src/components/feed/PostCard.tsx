import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/backend';
import { useUserProfileByPrincipal } from '@/hooks/useUserProfileByPrincipal';
import { createProfileImageUrl, revokeProfileImageUrl } from '@/utils/profileImageUrl';
import { Flag, MessageSquare } from 'lucide-react';
import { PostDetailDialog } from './PostDetailDialog';
import { FlagPostDialog } from './FlagPostDialog';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const { data: authorProfile } = useUserProfileByPrincipal(post.author);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (authorProfile?.profileImage) {
      const url = createProfileImageUrl(authorProfile.profileImage);
      setAvatarUrl(url);
      return () => {
        revokeProfileImageUrl(url);
      };
    }
  }, [authorProfile?.profileImage]);

  const authorName = authorProfile?.name || 'Anonymous';
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const contentPreview = post.content.length > 200 
    ? post.content.slice(0, 200) + '...' 
    : post.content;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{authorName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {post.instanceName}
                  </Badge>
                  <span>•</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm whitespace-pre-wrap">{contentPreview}</p>
          
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailOpen(true)}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFlagOpen(true)}
            >
              <Flag className="h-4 w-4 mr-1" />
              Flag
            </Button>
          </div>
        </CardContent>
      </Card>

      <PostDetailDialog
        postId={post.id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <FlagPostDialog
        postId={post.id}
        open={flagOpen}
        onOpenChange={setFlagOpen}
      />
    </>
  );
}
