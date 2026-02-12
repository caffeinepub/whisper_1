import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, ArrowLeft, Loader2, CheckCircle2, LogOut, Upload, X, Award, ImageIcon } from 'lucide-react';
import { IconBubble } from '@/components/common/IconBubble';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useCallerUserProfile';
import { useCallerContributionSummary } from '@/hooks/useCallerContributionSummary';
import { useActor } from '@/hooks/useActor';
import { LoginButton } from '@/components/common/LoginButton';
import { uiCopy } from '@/lib/uiCopy';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useContributionEventLogger } from '@/hooks/useContributionEventLogger';
import { CONTRIBUTION_ACTION_TYPES } from '@/lib/contributionActionTypes';

export default function ProfilePage() {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: contributionSummary, isLoading: summaryLoading } = useCallerContributionSummary();
  const saveMutation = useSaveCallerUserProfile();
  const logContribution = useContributionEventLogger();
  
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<Uint8Array | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  const isAuthenticated = !!identity;
  const actorReady = !!actor && !!identity;

  // Initialize form with existing profile data
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      if (userProfile.profileImage) {
        const blob = new Blob([new Uint8Array(userProfile.profileImage)], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setImagePreview(url);
        setProfileImage(new Uint8Array(userProfile.profileImage));
      }
      setHasChanges(false);
    }
  }, [userProfile]);

  // Cleanup image preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleBackToHome = () => {
    const basePath = import.meta.env.BASE_URL || '/';
    const homePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    window.history.pushState({}, '', homePath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setHasChanges(
      value !== (userProfile?.name || '') ||
      profileImage !== (userProfile?.profileImage ? new Uint8Array(userProfile.profileImage) : null)
    );
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(uiCopy.profile.imageInvalidType);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(uiCopy.profile.imageTooLarge);
      return;
    }

    setIsUploadingEvidence(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      setProfileImage(uint8Array);

      // Create preview URL
      const blob = new Blob([uint8Array], { type: file.type });
      const url = URL.createObjectURL(blob);
      
      // Revoke old preview URL
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setImagePreview(url);
      setHasChanges(true);

      // Log contribution event for evidence upload
      // Use a stable referenceId based on timestamp and file name
      const referenceId = `evidence_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      try {
        await logContribution.mutateAsync({
          actionType: CONTRIBUTION_ACTION_TYPES.EVIDENCE_ADDED,
          referenceId,
          details: `Evidence image uploaded: ${file.name}`,
        });
        toast.success('Evidence uploaded! Points awarded.');
      } catch (error) {
        // Don't break the upload flow if contribution logging fails
        console.warn('Failed to log contribution for evidence upload:', error);
      } finally {
        setIsUploadingEvidence(false);
      }
    };
    reader.onerror = () => {
      setIsUploadingEvidence(false);
      toast.error('Failed to read image file');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!actorReady) {
      toast.error('Actor not available. Please try again.');
      return;
    }

    if (!name.trim()) {
      toast.error(uiCopy.profile.nameRequired);
      return;
    }

    try {
      // Preserve all existing fields from loaded profile
      const profileToSave = {
        ...userProfile,
        name: name.trim(),
        profileImage: profileImage || undefined,
        tokenBalance: userProfile?.tokenBalance || { staked: 0n, voting: 0n, bounty: 0n, total: 0n },
        contributionPoints: userProfile?.contributionPoints || { city: 0n, voting: 0n, bounty: 0n, token: 0n },
      };
      
      await saveMutation.mutateAsync(profileToSave);
      toast.success(uiCopy.profile.saveSuccess);
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || uiCopy.profile.saveError);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Calculate total contribution points from backend summary
  const totalContributionPoints = contributionSummary 
    ? Number(contributionSummary.totalPoints)
    : 0;

  const renderProfileImageSection = () => (
    <div className="space-y-4">
      <Label className="text-white">{uiCopy.profile.imageLabel}</Label>
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 border-2 border-secondary">
          {imagePreview ? (
            <AvatarImage src={imagePreview} alt={name || 'Profile'} />
          ) : (
            <AvatarFallback className="bg-secondary/20 text-secondary">
              <User className="h-12 w-12" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('profile-image-input')?.click()}
              disabled={saveMutation.isPending || !actorReady || isUploadingEvidence}
              className="border-secondary text-secondary hover:bg-secondary/20 hover:text-secondary"
            >
              {isUploadingEvidence ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {imagePreview ? uiCopy.profile.changeImage : uiCopy.profile.uploadImage}
                </>
              )}
            </Button>
            {imagePreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                disabled={saveMutation.isPending || !actorReady || isUploadingEvidence}
                className="border-destructive text-destructive hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                {uiCopy.profile.removeImage}
              </Button>
            )}
          </div>
          <p className="text-xs text-white/60">{uiCopy.profile.imageHelper}</p>
        </div>
      </div>
      <input
        id="profile-image-input"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );

  const renderContributionPointsSection = () => {
    if (summaryLoading) {
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <LoadingIndicator label="Loading contribution points..." />
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-3">
          <IconBubble size="md" variant="secondary">
            <Award className="h-5 w-5" />
          </IconBubble>
          <div>
            <Label className="text-white text-lg font-semibold">{uiCopy.profile.contributionPointsLabel}</Label>
            <p className="text-xs text-white/60">{uiCopy.profile.contributionPointsHelper}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded border border-white/10">
            <p className="text-xs text-white/60 mb-1">Total Points</p>
            <p className="text-2xl font-bold text-secondary">{totalContributionPoints.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/5 rounded border border-white/10">
            <p className="text-xs text-white/60 mb-1">City Points</p>
            <p className="text-xl font-semibold text-white">{Number(contributionSummary?.totalCityPoints || 0n).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/5 rounded border border-white/10">
            <p className="text-xs text-white/60 mb-1">Voting Points</p>
            <p className="text-xl font-semibold text-white">{Number(contributionSummary?.totalVotingPoints || 0n).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/5 rounded border border-white/10">
            <p className="text-xs text-white/60 mb-1">Bounty Points</p>
            <p className="text-xl font-semibold text-white">{Number(contributionSummary?.totalBountyPoints || 0n).toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.05_230)] via-[oklch(0.18_0.05_230)] to-[oklch(0.20_0.05_230)]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[oklch(0.15_0.05_230)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBackToHome}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            {isAuthenticated && (
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="border-secondary text-secondary hover:bg-secondary/20 hover:text-secondary focus-visible:ring-secondary"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {!isAuthenticated ? (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Profile</CardTitle>
              <CardDescription className="text-white/70">
                Please log in to view and edit your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <LoginButton />
            </CardContent>
          </Card>
        ) : profileLoading ? (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="flex justify-center py-12">
              <LoadingIndicator label="Loading profile..." />
            </CardContent>
          </Card>
        ) : showProfileSetup ? (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Welcome to Whisper!</CardTitle>
              <CardDescription className="text-white/70">
                Let's set up your profile to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="setup-name" className="text-white">
                  Your Name
                </Label>
                <Input
                  id="setup-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary"
                  disabled={saveMutation.isPending || !actorReady}
                />
              </div>

              {renderProfileImageSection()}

              <Button
                onClick={handleSave}
                disabled={!name.trim() || saveMutation.isPending || !actorReady}
                className="w-full bg-secondary hover:bg-secondary/90 text-white"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Your Profile</CardTitle>
                <CardDescription className="text-white/70">
                  Manage your personal information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary"
                    disabled={saveMutation.isPending || !actorReady}
                  />
                </div>

                {renderProfileImageSection()}

                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || !name.trim() || saveMutation.isPending || !actorReady}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white disabled:opacity-50"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Contribution Points Section */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Contribution Points</CardTitle>
                <CardDescription className="text-white/70">
                  Track your contributions to the Whisper community
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderContributionPointsSection()}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
