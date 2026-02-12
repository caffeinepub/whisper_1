import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminFlaggedPosts, useClearFlag, useDeleteFlaggedPost } from '@/hooks/useAdminFlaggedPosts';
import { Loader2, CheckCircle2, Trash2, AlertTriangle, Flag } from 'lucide-react';
import type { Post } from '@/backend';

interface FlaggedPostsSectionProps {
  isAdmin: boolean;
}

export function FlaggedPostsSection({ isAdmin }: FlaggedPostsSectionProps) {
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const { data: flaggedPosts, isLoading, isError } = useAdminFlaggedPosts(pageSize, page * pageSize, isAdmin);
  const clearFlag = useClearFlag();
  const deletePost = useDeleteFlaggedPost();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'clear' | 'delete' | null;
    postId: bigint | null;
  }>({
    open: false,
    action: null,
    postId: null,
  });

  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const handleClearFlag = async (postId: bigint) => {
    setPendingActions((prev) => ({ ...prev, [postId.toString()]: true }));
    try {
      await clearFlag.mutateAsync(postId);
    } finally {
      setPendingActions((prev) => ({ ...prev, [postId.toString()]: false }));
      setConfirmDialog({ open: false, action: null, postId: null });
    }
  };

  const handleDeletePost = async (postId: bigint) => {
    setPendingActions((prev) => ({ ...prev, [postId.toString()]: true }));
    try {
      await deletePost.mutateAsync(postId);
    } finally {
      setPendingActions((prev) => ({ ...prev, [postId.toString()]: false }));
      setConfirmDialog({ open: false, action: null, postId: null });
    }
  };

  const openConfirmDialog = (action: 'clear' | 'delete', postId: bigint) => {
    setConfirmDialog({ open: true, action, postId });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Flagged Posts
          </CardTitle>
          <CardDescription>Review and moderate flagged content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Flagged Posts
          </CardTitle>
          <CardDescription>Review and moderate flagged content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <p className="text-muted-foreground">Failed to load flagged posts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const posts = flaggedPosts || [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Flagged Posts
          </CardTitle>
          <CardDescription>Review and moderate flagged content</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="rounded-full bg-muted p-6">
                <Flag className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-semibold">No Flagged Posts</h3>
                <p className="text-muted-foreground max-w-md">
                  All flagged posts have been reviewed. New flagged content will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Author</TableHead>
                      <TableHead className="font-semibold">Instance</TableHead>
                      <TableHead className="font-semibold">Content</TableHead>
                      <TableHead className="font-semibold">Flagged</TableHead>
                      <TableHead className="font-semibold">Reason</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post: Post) => {
                      const isPending = pendingActions[post.id.toString()];
                      const contentPreview = post.content.length > 100 
                        ? post.content.slice(0, 100) + '...' 
                        : post.content;

                      return (
                        <TableRow key={post.id.toString()} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            {post.authorName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{post.instanceName}</Badge>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="line-clamp-2 text-sm">{contentPreview}</p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {post.flaggedAt ? formatDate(post.flaggedAt) : 'N/A'}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {post.flaggedReason || 'No reason provided'}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openConfirmDialog('clear', post.id)}
                                disabled={isPending}
                                className="border-secondary text-secondary hover:bg-secondary hover:text-white"
                              >
                                {isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                                <span className="ml-1">Clear</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openConfirmDialog('delete', post.id)}
                                disabled={isPending}
                                className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                              >
                                {isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="ml-1">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={posts.length < pageSize}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null, postId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'clear' ? 'Clear Flag' : 'Delete Post'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'clear'
                ? 'Are you sure you want to clear the flag from this post? The post will remain visible.'
                : 'Are you sure you want to permanently delete this post? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.postId) {
                  if (confirmDialog.action === 'clear') {
                    handleClearFlag(confirmDialog.postId);
                  } else if (confirmDialog.action === 'delete') {
                    handleDeletePost(confirmDialog.postId);
                  }
                }
              }}
              className={
                confirmDialog.action === 'delete'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {confirmDialog.action === 'clear' ? 'Clear Flag' : 'Delete Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
