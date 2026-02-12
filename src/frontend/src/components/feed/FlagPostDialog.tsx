import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFlagPost } from '@/hooks/useFlagPost';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FlagPostDialogProps {
  postId: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlagPostDialog({ postId, open, onOpenChange }: FlagPostDialogProps) {
  const [reason, setReason] = useState('');
  const { identity } = useInternetIdentity();
  const flagPost = useFlagPost();

  const isAuthenticated = !!identity;

  const handleFlag = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to flag posts');
      onOpenChange(false);
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for flagging this post');
      return;
    }

    try {
      await flagPost.mutateAsync({ postId, reason: reason.trim() });
      setReason('');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Flag Post</AlertDialogTitle>
          <AlertDialogDescription>
            {isAuthenticated
              ? 'Please provide a reason for flagging this post. This will help moderators review the content.'
              : 'You must be logged in to flag posts.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isAuthenticated && (
          <div className="space-y-2 py-4">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Why are you flagging this post?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={flagPost.isPending}
              rows={3}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={flagPost.isPending}>Cancel</AlertDialogCancel>
          {isAuthenticated && (
            <AlertDialogAction
              onClick={handleFlag}
              disabled={flagPost.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {flagPost.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Flagging...
                </>
              ) : (
                'Flag Post'
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
