import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, FileText, Shield, File, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

type ModerationStatus = 'Pending' | 'Flagged' | 'Approved' | 'Rejected';

export interface ModerationItem {
  id: string;
  title: string;
  category: string;
  status: ModerationStatus;
  submittedBy: string;
  submittedAt: Date;
  instanceName: string;
}

interface ModerationItemsListProps {
  items: ModerationItem[];
  onApprove?: (instanceName: string) => void;
  onReject?: (instanceName: string) => void;
  onHide?: (instanceName: string) => void;
  onDelete?: (instanceName: string) => void;
  pendingActions?: Record<string, boolean>;
}

export function ModerationItemsList({ 
  items, 
  onApprove, 
  onReject, 
  onHide, 
  onDelete,
  pendingActions = {}
}: ModerationItemsListProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'reject' | 'hide' | 'delete' | null;
    instanceName: string;
    title: string;
  }>({
    open: false,
    action: null,
    instanceName: '',
    title: '',
  });

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
        <div className="rounded-full bg-muted p-6">
          <Shield className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">No Items to Moderate</h3>
          <p className="text-muted-foreground max-w-md">
            All submissions have been reviewed. New items requiring moderation will appear here.
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: ModerationStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'Flagged':
        return (
          <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            Flagged
          </Badge>
        );
      case 'Approved':
        return (
          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'proposal':
        return <FileText className="h-4 w-4 text-secondary" />;
      case 'complaint':
        return <Shield className="h-4 w-4 text-destructive" />;
      case 'foia':
        return <File className="h-4 w-4 text-accent" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const handleConfirmAction = () => {
    const { action, instanceName } = confirmDialog;
    
    if (action === 'reject' && onReject) {
      onReject(instanceName);
    } else if (action === 'hide' && onHide) {
      onHide(instanceName);
    } else if (action === 'delete' && onDelete) {
      onDelete(instanceName);
    }
    
    setConfirmDialog({ open: false, action: null, instanceName: '', title: '' });
  };

  const openConfirmDialog = (action: 'reject' | 'hide' | 'delete', instanceName: string, title: string) => {
    setConfirmDialog({ open: true, action, instanceName, title });
  };

  const getConfirmDialogContent = () => {
    const { action, title } = confirmDialog;
    
    switch (action) {
      case 'reject':
        return {
          title: 'Reject Submission',
          description: `Are you sure you want to reject "${title}"? This action cannot be undone.`,
          actionText: 'Reject',
          variant: 'destructive' as const,
        };
      case 'hide':
        return {
          title: 'Hide Submission',
          description: `Are you sure you want to hide "${title}"? It will no longer appear in the moderation queue.`,
          actionText: 'Hide',
          variant: 'default' as const,
        };
      case 'delete':
        return {
          title: 'Delete Submission',
          description: `Are you sure you want to permanently delete "${title}"? This action cannot be undone and will remove all associated data.`,
          actionText: 'Delete',
          variant: 'destructive' as const,
        };
      default:
        return {
          title: 'Confirm Action',
          description: 'Are you sure you want to proceed?',
          actionText: 'Confirm',
          variant: 'default' as const,
        };
    }
  };

  const isActionDisabled = (item: ModerationItem, action: 'approve' | 'reject' | 'hide' | 'delete') => {
    // Disable if action is pending for this item
    if (pendingActions[item.instanceName]) {
      return true;
    }

    // Disable approve/reject for non-pending items
    if ((action === 'approve' || action === 'reject') && item.status !== 'Pending') {
      return true;
    }

    return false;
  };

  const renderActionButtons = (item: ModerationItem, isMobile: boolean = false) => {
    const isPending = pendingActions[item.instanceName];
    const buttonSize = isMobile ? 'sm' : 'sm';
    const showLabels = !isMobile;

    return (
      <>
        <Button
          size={buttonSize}
          variant="outline"
          onClick={() => onApprove?.(item.instanceName)}
          disabled={isActionDisabled(item, 'approve')}
          className="border-secondary text-secondary hover:bg-secondary hover:text-white disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {showLabels && <span className="ml-1">Approve</span>}
        </Button>
        
        <Button
          size={buttonSize}
          variant="outline"
          onClick={() => openConfirmDialog('reject', item.instanceName, item.title)}
          disabled={isActionDisabled(item, 'reject')}
          className="border-destructive text-destructive hover:bg-destructive hover:text-white disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {showLabels && <span className="ml-1">Reject</span>}
        </Button>

        <Button
          size={buttonSize}
          variant="outline"
          onClick={() => openConfirmDialog('hide', item.instanceName, item.title)}
          disabled={isPending}
          className="border-muted-foreground text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          {showLabels && <span className="ml-1">Hide</span>}
        </Button>

        <Button
          size={buttonSize}
          variant="outline"
          onClick={() => openConfirmDialog('delete', item.instanceName, item.title)}
          disabled={isPending}
          className="border-destructive text-destructive hover:bg-destructive hover:text-white disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {showLabels && <span className="ml-1">Delete</span>}
        </Button>
      </>
    );
  };

  const dialogContent = getConfirmDialogContent();

  return (
    <>
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Item</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Submitted By</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium max-w-md">
                    <div className="flex items-start gap-2">
                      {getCategoryIcon(item.category)}
                      <span className="line-clamp-2">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{item.submittedBy}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(item.submittedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {renderActionButtons(item, false)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {getCategoryIcon(item.category)}
                    <CardTitle className="text-base leading-tight line-clamp-2">
                      {item.title}
                    </CardTitle>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="font-normal text-xs">
                    {item.category}
                  </Badge>
                  <span>•</span>
                  <span>{item.submittedBy}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Submitted {formatDate(item.submittedAt)}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {renderActionButtons(item, true)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null, instanceName: '', title: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={dialogContent.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {dialogContent.actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
