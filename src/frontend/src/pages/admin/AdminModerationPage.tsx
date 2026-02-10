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
import { getUserFacingError } from '@/utils/userFacingError';
import { uiCopy } from '@/lib/uiCopy';
import { toast } from 'sonner';

export default function AdminModerationPage() {
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});
  const [recheckingAccess, setRecheckingAccess] = useState(false);
  
  // Check admin status first
  const {
    data: isAdmin,
    isLoading: adminCheckLoading,
    error: adminCheckError,
    refetch: refetchAdminStatus,
    isFetched: adminCheckFetched,
    isAuthenticated,
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
      const { userMessage } = getUserFacingError(error);
      toast.error(userMessage);
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
      const { userMessage } = getUserFacingError(error);
      toast.error(userMessage);
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
      toast.success('Item hidden from moderation queue');
    } catch (error) {
      const { userMessage } = getUserFacingError(error);
      toast.error(userMessage);
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
      toast.success('Item deleted permanently');
    } catch (error) {
      const { userMessage } = getUserFacingError(error);
      toast.error(userMessage);
    } finally {
      setPendingActions(prev => {
        const updated = { ...prev };
        delete updated[instanceName];
        return updated;
      });
    }
  };

  // Not authenticated state: Show login prompt
  if (!isAuthenticated && !adminCheckLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBubble variant="secondary" size="md">
                <Shield className="h-5 w-5" />
              </IconBubble>
              <h1 className="text-xl font-bold text-white">{uiCopy.admin.pageTitle}</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="border-secondary text-secondary hover:bg-secondary hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {uiCopy.admin.backButton}
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <Card className="border-2 border-secondary/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                <div className="rounded-full bg-secondary/10 p-6">
                  <Shield className="h-12 w-12 text-secondary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{uiCopy.admin.authRequiredTitle}</h3>
                  <p className="text-muted-foreground max-w-md">
                    {uiCopy.admin.authRequiredMessage}
                  </p>
                  <div className="pt-4">
                    <LoginButton variant="default" size="lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Loading state: Connecting to backend / checking admin status
  if (adminCheckLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBubble variant="secondary" size="md">
                <Shield className="h-5 w-5" />
              </IconBubble>
              <h1 className="text-xl font-bold text-white">{uiCopy.admin.pageTitle}</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="border-secondary text-secondary hover:bg-secondary hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {uiCopy.admin.backButton}
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="flex justify-center items-center py-20">
            <LoadingIndicator label={uiCopy.admin.checkingAccessMessage} />
          </div>
        </main>
      </div>
    );
  }

  // Error state: Admin check failed
  if (adminCheckError && adminCheckFetched) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBubble variant="secondary" size="md">
                <Shield className="h-5 w-5" />
              </IconBubble>
              <h1 className="text-xl font-bold text-white">{uiCopy.admin.pageTitle}</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="border-secondary text-secondary hover:bg-secondary hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {uiCopy.admin.backButton}
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <Card className="border-2 border-destructive/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                <div className="rounded-full bg-destructive/10 p-6">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{uiCopy.admin.errorTitle}</h3>
                  <p className="text-muted-foreground max-w-md">
                    {getUserFacingError(adminCheckError).userMessage}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => refetchAdminStatus()}
                    className="mt-4"
                  >
                    {uiCopy.admin.retryButton}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Access Denied: User is authenticated but not an admin
  if (adminCheckFetched && isAdmin === false) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBubble variant="secondary" size="md">
                <Shield className="h-5 w-5" />
              </IconBubble>
              <h1 className="text-xl font-bold text-white">{uiCopy.admin.pageTitle}</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="border-secondary text-secondary hover:bg-secondary hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {uiCopy.admin.backButton}
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <Card className="border-2 border-destructive/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                <div className="rounded-full bg-destructive/10 p-6">
                  <ShieldOff className="h-12 w-12 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{uiCopy.admin.accessDeniedTitle}</h3>
                  <p className="text-muted-foreground max-w-md">
                    {uiCopy.admin.accessDeniedMessage}
                  </p>
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      onClick={handleRecheckAccess}
                      disabled={recheckingAccess}
                      className="border-secondary text-secondary hover:bg-secondary/20 hover:text-secondary"
                    >
                      {recheckingAccess ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          {uiCopy.admin.recheckingAccessMessage}
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {uiCopy.admin.recheckAccessButton}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Main content: Admin is verified, show moderation queue
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBubble variant="secondary" size="md">
              <Shield className="h-5 w-5" />
            </IconBubble>
            <h1 className="text-xl font-bold text-white">{uiCopy.admin.pageTitle}</h1>
          </div>
          <Button
            variant="outline"
            onClick={handleBackToHome}
            className="border-secondary text-secondary hover:bg-secondary hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {uiCopy.admin.backButton}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{uiCopy.admin.pageTitle}</CardTitle>
            <CardDescription className="text-white/70">
              {uiCopy.admin.pageDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="py-12">
                <LoadingIndicator label={uiCopy.admin.loadingMessage} />
              </div>
            ) : itemsError ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="rounded-full bg-destructive/10 p-6">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-white">{uiCopy.proposals.errorMessage}</h3>
                  <p className="text-white/70">{getUserFacingError(itemsError).userMessage}</p>
                  <Button
                    onClick={() => refetchItems()}
                    variant="outline"
                    className="mt-4 border-secondary text-secondary hover:bg-secondary/20 hover:text-secondary"
                  >
                    {uiCopy.admin.retryButton}
                  </Button>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <div className="rounded-full bg-success/10 p-6 inline-block mb-4">
                  <Shield className="h-12 w-12 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{uiCopy.admin.emptyQueueTitle}</h3>
                <p className="text-white/70">{uiCopy.admin.emptyQueueMessage}</p>
              </div>
            ) : (
              <ModerationItemsList
                items={items}
                pendingActions={pendingActions}
                onApprove={handleApprove}
                onReject={handleReject}
                onHide={handleHide}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
