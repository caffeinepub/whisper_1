import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import { useModerationItems } from '@/hooks/useModerationItems';
import { LoginButton } from '@/components/common/LoginButton';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ModerationItemsList } from './components/ModerationItemsList';
import { uiCopy } from '@/lib/uiCopy';
import { spaNavigate } from '@/utils/spaNavigate';

export default function AdminModerationPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched, isAuthenticated, refetch: refetchAdmin } = useIsCallerAdmin();
  const { data: moderationItems, isLoading: itemsLoading, error: itemsError, refetch: refetchItems } = useModerationItems();

  const handleBackToHome = () => {
    spaNavigate('/');
  };

  const handleViewDeletionRequests = () => {
    spaNavigate('/admin/deletion-requests');
  };

  const handleRecheckAccess = async () => {
    await refetchAdmin();
  };

  // Auth required
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{uiCopy.admin.authRequiredTitle}</CardTitle>
            <CardDescription>{uiCopy.admin.authRequiredMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginButton />
            <Button variant="outline" onClick={handleBackToHome} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {uiCopy.admin.backButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading admin check
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingIndicator label={uiCopy.admin.checkingAccessMessage} />
      </div>
    );
  }

  // Access denied with recheck option
  if (adminFetched && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{uiCopy.admin.accessDeniedTitle}</CardTitle>
            <CardDescription>{uiCopy.admin.accessDeniedDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRecheckAccess} className="w-full">
              {uiCopy.admin.recheckAccessButton}
            </Button>
            <Button variant="outline" onClick={handleBackToHome} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {uiCopy.admin.backButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToHome}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {uiCopy.common.back}
          </Button>
          <h1 className="text-lg font-semibold">{uiCopy.admin.title}</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{uiCopy.admin.pageTitle}</CardTitle>
              <CardDescription>{uiCopy.admin.pageDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleViewDeletionRequests} variant="outline">
                View Deletion Requests
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{uiCopy.admin.moderationQueue}</CardTitle>
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingIndicator label={uiCopy.admin.loadingMessage} />
                </div>
              ) : itemsError ? (
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">{uiCopy.admin.errorTitle}</p>
                  <Button onClick={() => refetchItems()}>{uiCopy.admin.retryButton}</Button>
                </div>
              ) : !moderationItems || moderationItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lg font-semibold mb-2">{uiCopy.admin.emptyQueueTitle}</p>
                  <p className="text-muted-foreground">{uiCopy.admin.emptyQueueMessage}</p>
                </div>
              ) : (
                <ModerationItemsList items={moderationItems} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
