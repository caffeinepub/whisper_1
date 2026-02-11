import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, AlertCircle, ShieldOff, RefreshCw } from 'lucide-react';
import { IconBubble } from '@/components/common/IconBubble';
import { LoginButton } from '@/components/common/LoginButton';
import { ModerationItemsList } from './components/ModerationItemsList';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useModerationItems } from '@/hooks/useModerationItems';
import { useUpdateProposalStatus } from '@/hooks/useUpdateProposalStatus';
import { useHideProposal } from '@/hooks/useHideProposal';
import { useDeleteProposal } from '@/hooks/useDeleteProposal';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { userFacingError } from '@/utils/userFacingError';
import { uiCopy } from '@/lib/uiCopy';
import { toast } from 'sonner';

export default function AdminModerationPage() {
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});
  const [recheckingAccess, setRecheckingAccess] = useState(false);
  
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  
  // Check admin status first
  const {
    data: isAdmin,
    isLoading: adminCheckLoading,
    error: adminCheckError,
    refetch: refetchAdminStatus,
    isFetched: adminCheckFetched,
  } = useIsCallerAdmin();

  // Only fetch moderation items if user is admin
  const {
    data: items = [],
    isLoading: itemsLoading,
    error: itemsError,
    isFetched: itemsFetched,
    refetch: refetchItems,
  } = useModerationItems({ enabled: isAdmin === true });

  const updateStatusMutation = useUpdateProposalStatus();
  const hideMutation = useHideProposal();
  const deleteMutation = useDeleteProposal();

  // Auto-recheck admin status after authentication completes
  useEffect(() => {
    if (isAuthenticated && adminCheckFetched && isAdmin === false) {
      // Give backend a moment to complete first-user admin assignment
      const timer = setTimeout(() => {
        refetchAdminStatus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, adminCheckFetched, isAdmin, refetchAdminStatus]);

  const handleBackToHome = () => {
    // Use base-path-safe navigation
    const basePath = import.meta.env.BASE_URL || '/';
    const homePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    window.history.pushState({}, '', homePath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleRecheckAccess = async () => {
    setRecheckingAccess(true);
    try {
      await refetchAdminStatus();
    } finally {
      setRecheckingAccess(false);
    }
  };

  const handleApprove = async (instanceName: string) => {
    setPendingActions(prev => ({ ...prev, [instanceName]: true }));
    
    try {
      await updateStatusMutation.mutateAsync({
        instanceName,
        newStatus: 'Approved',
      });
      toast.success('Proposal approved successfully');
    } catch (error) {
      const errorMessage = userFacingError(error);
      toast.error(errorMessage);
    } finally {
      setPendingActions(prev => {
        const updated = { ...prev };
        delete updated[instanceName];
        return updated;
      });
    }
  };

  const handleReject = async (instanceName: string) => {
    setPendingActions(prev => ({ ...prev, [instanceName]: true }));
    
    try {
      await updateStatusMutation.mutateAsync({
        instanceName,
        newStatus: 'Rejected',
      });
      toast.success('Proposal rejected');
    } catch (error) {
      const errorMessage = userFacingError(error);
      toast.error(errorMessage);
    } finally {
      setPendingActions(prev => {
        const updated = { ...prev };
        delete updated[instanceName];
        return updated;
      });
    }
  };

  const handleHide = async (instanceName: string) => {
    setPendingActions(prev => ({ ...prev, [instanceName]: true }));
    
    try {
      await hideMutation.mutateAsync(instanceName);
      toast.success('Proposal hidden from queue');
    } catch (error) {
      const errorMessage = userFacingError(error);
      toast.error(errorMessage);
    } finally {
      setPendingActions(prev => {
        const updated = { ...prev };
        delete updated[instanceName];
        return updated;
      });
    }
  };

  const handleDelete = async (instanceName: string) => {
    setPendingActions(prev => ({ ...prev, [instanceName]: true }));
    
    try {
      await deleteMutation.mutateAsync(instanceName);
      toast.success('Proposal deleted');
    } catch (error) {
      const errorMessage = userFacingError(error);
      toast.error(errorMessage);
    } finally {
      setPendingActions(prev => {
        const updated = { ...prev };
        delete updated[instanceName];
        return updated;
      });
    }
  };

  // Show authentication required state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <IconBubble variant="secondary">
                  <Shield className="h-5 w-5" />
                </IconBubble>
                <CardTitle>{uiCopy.admin.authRequiredTitle}</CardTitle>
              </div>
              <CardDescription>{uiCopy.admin.authRequiredMessage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LoginButton />
              <Button
                variant="outline"
                onClick={handleBackToHome}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {uiCopy.admin.backButton}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading state while checking admin status
  if (adminCheckLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <LoadingIndicator label={uiCopy.admin.checkingAccessMessage} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state if admin check failed
  if (adminCheckError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <IconBubble variant="secondary">
                  <AlertCircle className="h-5 w-5" />
                </IconBubble>
                <CardTitle>{uiCopy.admin.errorTitle}</CardTitle>
              </div>
              <CardDescription>
                {userFacingError(adminCheckError)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => refetchAdminStatus()}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {uiCopy.admin.retryButton}
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToHome}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {uiCopy.admin.backButton}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <IconBubble variant="secondary">
                  <ShieldOff className="h-5 w-5" />
                </IconBubble>
                <CardTitle>{uiCopy.admin.accessDeniedTitle}</CardTitle>
              </div>
              <CardDescription>{uiCopy.admin.accessDeniedDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleRecheckAccess}
                disabled={recheckingAccess}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${recheckingAccess ? 'animate-spin' : ''}`} />
                {recheckingAccess ? uiCopy.admin.recheckingAccessMessage : uiCopy.admin.recheckAccessButton}
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToHome}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {uiCopy.admin.backButton}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main admin moderation interface
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {uiCopy.common.back}
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <IconBubble variant="secondary">
              <Shield className="h-6 w-6" />
            </IconBubble>
            <h1 className="text-3xl font-bold">{uiCopy.admin.pageTitle}</h1>
          </div>
          <p className="text-muted-foreground">{uiCopy.admin.pageDescription}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{uiCopy.admin.moderationQueue}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchItems()}
                disabled={itemsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${itemsLoading ? 'animate-spin' : ''}`} />
                {uiCopy.proposals.refreshButton}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {itemsLoading && !itemsFetched ? (
              <LoadingIndicator label={uiCopy.admin.loadingMessage} />
            ) : itemsError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {userFacingError(itemsError)}
                </p>
                <Button onClick={() => refetchItems()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {uiCopy.admin.retryButton}
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{uiCopy.admin.emptyQueueTitle}</h3>
                <p className="text-muted-foreground">{uiCopy.admin.emptyQueueMessage}</p>
              </div>
            ) : (
              <ModerationItemsList
                items={items}
                onApprove={handleApprove}
                onReject={handleReject}
                onHide={handleHide}
                onDelete={handleDelete}
                pendingActions={pendingActions}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
