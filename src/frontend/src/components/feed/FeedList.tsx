import { useEffect, useRef } from 'react';
import { PostCard } from './PostCard';
import { Loader2 } from 'lucide-react';
import type { Post } from '@/backend';

interface FeedListProps {
  posts: Post[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onViewDetails: (postId: bigint) => void;
  onFlag: (postId: bigint) => void;
  instanceName: string;
}

export function FeedList({
  posts,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onViewDetails,
  onFlag,
  instanceName,
}: FeedListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore, instanceName]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id.toString()}
          post={post}
          onViewDetails={() => onViewDetails(post.id)}
          onFlag={() => onFlag(post.id)}
        />
      ))}

      {/* Intersection observer target */}
      <div ref={observerTarget} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-secondary" />
        </div>
      )}
    </div>
  );
}
