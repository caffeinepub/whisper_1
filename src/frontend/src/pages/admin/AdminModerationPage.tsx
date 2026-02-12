import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import { useModerationItems } from '@/hooks/useModerationItems';
import { ModerationItemsList } from './components/ModerationItemsList';
import { ContributionLogsSection } from './components/ContributionLogsSection';
import { TokenOperationsSection } from './components/TokenOperationsSection';
import { IconBubble } from '@/components/common/IconBubble';

export default function AdminModerationPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: moderationItems = [], isLoading: itemsLoading } = useModerationItems({
    enabled: !!isAdmin,
  });
  const [showContent, setShowContent] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!adminCheckLoading && isAdmin) {
      setShowContent(true);
    }
  }, [adminCheckLoading, isAdmin]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to access the admin panel.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  if (adminCheckLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <IconBubble size="md" variant="secondary">
                  <AlertCircle className="h-5 w-5" />
                </IconBubble>
                <div>
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>You do not have permission to access this page.</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <IconBubble size="md" variant="secondary">
                  <Shield className="h-5 w-5" />
                </IconBubble>
                <div>
                  <CardTitle>Admin Moderation</CardTitle>
                  <CardDescription>Review and manage proposals and contributions</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {showContent && (
            <>
              <ModerationItemsList items={moderationItems} />
              <TokenOperationsSection />
              <ContributionLogsSection isAdmin={isAdmin} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
