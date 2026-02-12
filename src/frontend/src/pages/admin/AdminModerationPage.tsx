import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw } from 'lucide-react';
import { IconBubble } from '@/components/common/IconBubble';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { LoginButton } from '@/components/common/LoginButton';
import { ModerationItemsList } from './components/ModerationItemsList';
import { ContributionLogsSection } from './components/ContributionLogsSection';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useModerationItems } from '@/hooks/useModerationItems';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import { uiCopy } from '@/lib/uiCopy';
import { userFacingError } from '@/utils/userFacingError';

export default function AdminModerationPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: items, isLoading: itemsLoading, isError, error, refetch } = useModerationItems();

  const isAuthenticated = !!identity;
  const showAdminContent = isAuthenticated && isAdmin;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.05_230)] via-[oklch(0.18_0.05_230)] to-[oklch(0.20_0.05_230)] flex items-center justify-center p-4">
        <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <IconBubble size="lg" variant="secondary">
                <Shield className="h-6 w-6" />
              </IconBubble>
              <CardTitle className="text-2xl">{uiCopy.admin.authRequired}</CardTitle>
            </div>
            <CardDescription className="text-white/70">
              {uiCopy.admin.authDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <LoginButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.05_230)] via-[oklch(0.18_0.05_230)] to-[oklch(0.20_0.05_230)] flex items-center justify-center p-4">
        <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white max-w-md w-full">
          <CardContent className="py-12">
            <LoadingIndicator label="Checking admin access..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!showAdminContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.05_230)] via-[oklch(0.18_0.05_230)] to-[oklch(0.20_0.05_230)] flex items-center justify-center p-4">
        <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <IconBubble size="lg" variant="secondary">
                <Shield className="h-6 w-6" />
              </IconBubble>
              <CardTitle className="text-2xl">{uiCopy.admin.authRequired}</CardTitle>
            </div>
            <CardDescription className="text-white/70">
              You do not have administrator privileges.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.05_230)] via-[oklch(0.18_0.05_230)] to-[oklch(0.20_0.05_230)]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconBubble size="lg" variant="secondary">
                    <Shield className="h-6 w-6" />
                  </IconBubble>
                  <div>
                    <CardTitle className="text-2xl">{uiCopy.admin.pageTitle}</CardTitle>
                    <CardDescription className="text-white/70">
                      {uiCopy.admin.pageDescription}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={itemsLoading}
                  className="border-secondary text-secondary hover:bg-secondary/20"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${itemsLoading ? 'animate-spin' : ''}`} />
                  {uiCopy.admin.refreshButton}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Moderation Queue */}
          {itemsLoading ? (
            <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white">
              <CardContent className="py-12">
                <LoadingIndicator label={uiCopy.admin.loadingMessage} />
              </CardContent>
            </Card>
          ) : isError ? (
            <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <p className="text-white/70">{userFacingError(error)}</p>
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="border-secondary text-secondary hover:bg-secondary/20"
                  >
                    {uiCopy.admin.refreshButton}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ModerationItemsList items={items || []} />
          )}

          {/* Contribution Logs Section - only render when admin is confirmed */}
          {isAdmin && <ContributionLogsSection isAdmin={isAdmin} />}
        </div>
      </div>
    </div>
  );
}
