import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import { useGetDeletionRequests } from '@/hooks/useQueries';
import { useProcessDeletionRequest } from '@/hooks/useAccountDeletion';
import { LoginButton } from '@/components/common/LoginButton';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { spaNavigate } from '@/utils/spaNavigate';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AdminDeletionRequestsPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched, isAuthenticated } = useIsCallerAdmin();
  const { data: deletionRequests, isLoading: requestsLoading, refetch } = useGetDeletionRequests();
  const processMutation = useProcessDeletionRequest();

  const [processingPrincipal, setProcessingPrincipal] = useState<string | null>(null);

  const handleBackToAdmin = () => {
    spaNavigate('/admin');
  };

  const handleProcessDeletion = async (principalString: string) => {
    try {
      setProcessingPrincipal(principalString);
      const principal = { __principal__: principalString } as any;
      await processMutation.mutateAsync(principal);
      toast.success('Deletion request processed successfully');
      refetch();
    } catch (error) {
      console.error('Failed to process deletion:', error);
      toast.error('Failed to process deletion request');
    } finally {
      setProcessingPrincipal(null);
    }
  };

  // Auth required
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginButton />
            <Button variant="outline" onClick={handleBackToAdmin} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
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
        <LoadingIndicator label="Checking access..." />
      </div>
    );
  }

  // Access denied
  if (adminFetched && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleBackToAdmin} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
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
          <Button variant="ghost" onClick={handleBackToAdmin}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          <h1 className="text-lg font-semibold">Deletion Requests</h1>
          <div className="w-24" />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Account Deletion Requests</CardTitle>
            <CardDescription>Review and process user account deletion requests</CardDescription>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingIndicator label="Loading requests..." />
              </div>
            ) : !deletionRequests || deletionRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No deletion requests pending</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deletionRequests.map(([principal, request]) => {
                  const principalString = principal.toString();
                  const isProcessing = processingPrincipal === principalString;

                  return (
                    <Card key={principalString}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">User</Badge>
                              <span className="text-sm font-mono text-muted-foreground break-all">
                                {principalString}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Requested: {new Date(Number(request.requestedAt) / 1000000).toLocaleDateString()}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Process Deletion
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Account Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the user's profile and all associated data. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleProcessDeletion(principalString)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Account
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
