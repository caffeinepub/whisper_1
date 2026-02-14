import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flag } from 'lucide-react';
import { useUserProfileByPrincipal } from '@/hooks/useUserProfileByPrincipal';
import { UserAvatar } from '@/components/common/UserAvatar';
import type { Post } from '@/backend';

interface PostCardProps {
  post: Post;
  onViewDetails: () => void;
  onFlag: () => void;
}

export function PostCard({ post, onViewDetails, onFlag }: PostCardProps) {
  const { data: authorProfile } = useUserProfileByPrincipal(post.author);

  const authorName = authorProfile?.name || 'Anonymous';

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <UserAvatar
            imageBytes={authorProfile?.profileImage}
            name={authorName}
            className="h-10 w-10"
            fallbackClassName="bg-secondary text-secondary-foreground text-sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold truncate">{authorName}</p>
              <Badge variant="outline" className="text-xs">
                {post.instanceName}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        <p className="text-sm mb-4 whitespace-pre-wrap break-words">{truncateContent(post.content)}</p>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
            View Details
          </Button>
          <Button variant="ghost" size="sm" onClick={onFlag}>
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
