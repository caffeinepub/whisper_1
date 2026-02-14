import { useState } from 'react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useModerationItems } from '@/hooks/useModerationItems';
import { useUpdateProposalStatus } from '@/hooks/useUpdateProposalStatus';
import { useHideProposal } from '@/hooks/useHideProposal';
import { useDeleteProposal } from '@/hooks/useDeleteProposal';
import { PageLayout } from '@/components/common/PageLayout';
import { BackNav } from '@/components/common/BackNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle } from 'lucide-react';
import { ModerationItemsList } from './components/ModerationItemsList';
import { FlaggedPostsSection } from './components/FlaggedPostsSection';
import { TokenOperationsSection } from './components/TokenOperationsSection';
import { ContributionLogsSection } from './components/ContributionLogsSection';
import { toast } from 'sonner';

export default function AdminModerationPage() {
  const { data: isAdmin, isLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState('moderation');
  const { data: moderationItems, isLoading: itemsLoading } = useModerationItems({ enabled: !!isAdmin });
  const updateStatus = useUpdateProposalStatus();
  const hideProposal = useHideProposal();
  const deleteProposal = useDeleteProposal();
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});

  const handleApprove = async (instanceName: string) => {
    setPendingActions((prev) => ({ ...prev, [instanceName]: true }));
    try {
      await updateStatus.mutateAsync({ instanceName, newStatus: 'Approved' });
      toast.success('Proposal approved successfully');
    } catch (error) {
      toast.error('Failed to approve proposal');
    } finally {
      setPendingActions((prev) => ({ ...prev, [instanceName]: false }));
    }
  };

  const handleReject = async (instanceName: string) => {
    setPendingActions((prev) => ({ ...prev, [instanceName]: true }));
    try {
      await updateStatus.mutateAsync({ instanceName, newStatus: 'Rejected' });
      toast.success('Proposal rejected successfully');
    } catch (error) {
      toast.error('Failed to reject proposal');
    } finally {
      setPendingActions((prev) => ({ ...prev, [instanceName]: false }));
    }
  };

  const handleHide = async (instanceName: string) => {
    setPendingActions((prev) => ({ ...prev, [instanceName]: true }));
    try {
      await hideProposal.mutateAsync(instanceName);
      toast.success('Proposal hidden successfully');
    } catch (error) {
      toast.error('Failed to hide proposal');
    } finally {
      setPendingActions((prev) => ({ ...prev, [instanceName]: false }));
    }
  };

  const handleDelete = async (instanceName: string) => {
    setPendingActions((prev) => ({ ...prev, [instanceName]: true }));
    try {
      await deleteProposal.mutateAsync(instanceName);
      toast.success('Proposal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete proposal');
    } finally {
      setPendingActions((prev) => ({ ...prev, [instanceName]: false }));
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <BackNav to="/" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout maxWidth="md">
        <BackNav to="/" />
        <Card className="mt-8 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You do not have permission to access this page. Admin privileges are required.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <BackNav to="/" />
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Moderation</CardTitle>
            <CardDescription>Manage proposals, posts, tokens, and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="moderation">Proposals</TabsTrigger>
                <TabsTrigger value="posts">Flagged Posts</TabsTrigger>
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
              </TabsList>

              <TabsContent value="moderation" className="mt-6">
                {itemsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
              </TabsContent>

              <TabsContent value="posts" className="mt-6">
                <FlaggedPostsSection isAdmin={!!isAdmin} />
              </TabsContent>

              <TabsContent value="tokens" className="mt-6">
                <TokenOperationsSection />
              </TabsContent>

              <TabsContent value="contributions" className="mt-6">
                <ContributionLogsSection isAdmin={!!isAdmin} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
