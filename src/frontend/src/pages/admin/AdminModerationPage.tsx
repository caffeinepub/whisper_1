import { HomeHeader } from '@/components/common/HomeHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModerationItemsList } from './components/ModerationItemsList';
import { TokenOperationsSection } from './components/TokenOperationsSection';
import { ContributionLogsSection } from './components/ContributionLogsSection';
import { FlaggedPostsSection } from './components/FlaggedPostsSection';
import { useModerationItems } from '@/hooks/useModerationItems';
import { useUpdateProposalStatus } from '@/hooks/useUpdateProposalStatus';
import { useHideProposal } from '@/hooks/useHideProposal';
import { useDeleteProposal } from '@/hooks/useDeleteProposal';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function AdminModerationPage() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: moderationItems, isLoading: itemsLoading, isError } = useModerationItems({ enabled: isAdmin || false });
  const updateStatus = useUpdateProposalStatus();
  const hideProposal = useHideProposal();
  const deleteProposal = useDeleteProposal();

  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});

  const handleApprove = async (instanceName: string) => {
    setPendingActions((prev) => ({ ...prev, [instanceName]: true }));
    try {
      await updateStatus.mutateAsync({ instanceName, newStatus: 'Approved' });
    } finally {
      setPendingActions((prev) => ({ ...prev, [instanceName]: false }));
    }
  };

  const handleReject = async (instanceName: string) => {
    setPendingActions((prev) => ({ ...prev, [instanceName]: true }));
    try {
      await updateStatus.mutateAsync({ instanceName, newStatus: 'Rejected' });
    } finally {
      setPendingActions((prev) => ({ ...prev, [instanceName]: false }));
    }
  };

  const handleHide = async (instanceName: string) => {
    setPendingActions((prev) => ({ ...prev, [instanceName]: true }));
    try {
      await hideProposal.mutateAsync(instanceName);
    } finally {
      setPendingActions((prev) => ({ ...prev, [instanceName]: false }));
    }
  };

  const handleDelete = async (instanceName: string) => {
    setPendingActions((prev) => ({ ...prev, [instanceName]: true }));
    try {
      await deleteProposal.mutateAsync(instanceName);
    } finally {
      setPendingActions((prev) => ({ ...prev, [instanceName]: false }));
    }
  };

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-background">
        <HomeHeader />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <HomeHeader />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You do not have permission to access the admin moderation panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This page is restricted to administrators only. If you believe you should have access,
                please contact a system administrator.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-secondary" />
              Admin Moderation
            </h1>
            <p className="text-muted-foreground">
              Review and moderate community submissions, manage tokens, and view contribution logs
            </p>
          </div>

          {/* Moderation Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Moderation Queue</CardTitle>
              <CardDescription>
                Review pending proposals and take action
              </CardDescription>
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                  <p className="text-muted-foreground">Failed to load moderation items</p>
                </div>
              ) : (
                <ModerationItemsList
                  items={moderationItems || []}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onHide={handleHide}
                  onDelete={handleDelete}
                  pendingActions={pendingActions}
                />
              )}
            </CardContent>
          </Card>

          {/* Flagged Posts Section */}
          <FlaggedPostsSection isAdmin={isAdmin} />

          {/* Token Operations */}
          <TokenOperationsSection />

          {/* Contribution Logs */}
          <ContributionLogsSection isAdmin={isAdmin} />
        </div>
      </main>
    </div>
  );
}
