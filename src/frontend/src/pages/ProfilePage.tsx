import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Award, Upload, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useCallerUserProfile';
import { useCallerContributionSummary } from '@/hooks/useCallerContributionSummary';
import { useContributionEventLogger } from '@/hooks/useContributionEventLogger';
import { CONTRIBUTION_ACTION_TYPES } from '@/lib/contributionActionTypes';
import { showEarnedPointsToast } from '@/lib/earnedPointsToast';
import { IconBubble } from '@/components/common/IconBubble';
import { uiCopy } from '@/lib/uiCopy';
import type { UserProfile } from '@/backend';

export default function ProfilePage() {
  const { identity, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: contributionSummary, isLoading: summaryLoading } = useCallerContributionSummary();
  const saveProfile = useSaveCallerUserProfile();
  const logContribution = useContributionEventLogger();

  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [contributionError, setContributionError] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      if (userProfile.profileImage) {
        const blob = new Blob([new Uint8Array(userProfile.profileImage)], { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        setImagePreview(imageUrl);
      }
    }
  }, [userProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    // Clear any previous contribution errors
    setContributionError(null);

    let profileImage: Uint8Array | undefined;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      profileImage = new Uint8Array(arrayBuffer);
    } else if (userProfile?.profileImage) {
      profileImage = userProfile.profileImage;
    }

    const profile: UserProfile = {
      name: name.trim(),
      profileImage,
      tokenBalance: userProfile?.tokenBalance || {
        staked: 0n,
        voting: 0n,
        bounty: 0n,
        total: 0n,
      },
      contributionPoints: userProfile?.contributionPoints || {
        city: 0n,
        voting: 0n,
        bounty: 0n,
        token: 0n,
      },
    };

    try {
      await saveProfile.mutateAsync(profile);
      setIsEditing(false);
      setImageFile(null);

      // Log contribution event for evidence upload if image was added
      if (imageFile && !userProfile?.profileImage) {
        try {
          const timestamp = Date.now();
          const contributionResult = await logContribution.mutateAsync({
            actionType: CONTRIBUTION_ACTION_TYPES.EVIDENCE_ADDED,
            referenceId: `profile-image-${timestamp}`,
            details: 'Profile image uploaded',
          });

          // Show earned-points toast immediately if not a duplicate
          if (!contributionResult.isDuplicate) {
            showEarnedPointsToast({
              pointsAwarded: contributionResult.pointsAwarded,
              actionType: contributionResult.actionType,
              origin: 'standard',
              queryClient,
            });
          }
        } catch (error: any) {
          // Don't block the success flow, but show inline message
          const errorMessage = error?.message || 'Could not record contribution points.';
          setContributionError(errorMessage);
          console.warn('Failed to log contribution for profile image upload:', error);
        }
      }
    } catch (error: any) {
      console.error('Failed to save profile:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to view your profile.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  if (profileLoading || summaryLoading) {
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

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <IconBubble size="md" variant="secondary">
                  <User className="h-5 w-5" />
                </IconBubble>
                <div>
                  <CardTitle>Welcome!</CardTitle>
                  <CardDescription>Let's set up your profile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={saveProfile.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Profile Image (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {imagePreview ? (
                        <AvatarImage src={imagePreview} alt="Profile" />
                      ) : (
                        <AvatarFallback>
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('image')?.click()}
                      disabled={saveProfile.isPending}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {contributionError && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-warning">{contributionError}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={!name.trim() || saveProfile.isPending}
                className="w-full"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <IconBubble size="md" variant="secondary">
                  <User className="h-5 w-5" />
                </IconBubble>
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  {imagePreview ? (
                    <AvatarImage src={imagePreview} alt="Profile" />
                  ) : (
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    {isEditing ? (
                      <Input
                        id="edit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={saveProfile.isPending}
                      />
                    ) : (
                      <p className="text-lg font-medium">{userProfile?.name}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-image">Profile Image</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('edit-image')?.click()}
                          disabled={saveProfile.isPending}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Image
                        </Button>
                        <input
                          id="edit-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {contributionError && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-warning">{contributionError}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setName(userProfile?.name || '');
                        setImageFile(null);
                        if (userProfile?.profileImage) {
                          const blob = new Blob([new Uint8Array(userProfile.profileImage)], {
                            type: 'image/jpeg',
                          });
                          const imageUrl = URL.createObjectURL(blob);
                          setImagePreview(imageUrl);
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      disabled={saveProfile.isPending}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!name.trim() || saveProfile.isPending}>
                      {saveProfile.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <IconBubble size="md" variant="accent">
                  <Award className="h-5 w-5" />
                </IconBubble>
                <div>
                  <CardTitle>{uiCopy.profile.contributionPointsLabel}</CardTitle>
                  <CardDescription>{uiCopy.profile.contributionPointsHelper}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">
                    {contributionSummary ? Number(contributionSummary.totalPoints) : 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">City Points</p>
                  <p className="text-2xl font-bold">
                    {contributionSummary ? Number(contributionSummary.totalCityPoints) : 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Voting Points</p>
                  <p className="text-2xl font-bold">
                    {contributionSummary ? Number(contributionSummary.totalVotingPoints) : 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bounty Points</p>
                  <p className="text-2xl font-bold">
                    {contributionSummary ? Number(contributionSummary.totalBountyPoints) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
