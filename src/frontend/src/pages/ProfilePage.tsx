import { useState } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useCallerUserProfile';
import { useWspBalance } from '@/hooks/useWspBalance';
import { useCallerContributionSummary } from '@/hooks/useCallerContributionSummary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { LoginButton } from '@/components/common/LoginButton';
import { HomeHeader } from '@/components/common/HomeHeader';
import { BackNav } from '@/components/common/BackNav';
import { UserAvatar } from '@/components/common/UserAvatar';
import { StakingSection } from './profile/components/StakingSection';
import { GovernanceSection } from './profile/components/GovernanceSection';
import { formatTokenAmount } from '@/lib/formatTokenAmount';
import { uiCopy } from '@/lib/uiCopy';

export default function ProfilePage() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, error: profileError, refetch } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending: isSaving } = useSaveCallerUserProfile();
  const { data: wspBalance, isLoading: balanceLoading } = useWspBalance();
  const { data: contributionSummary, isLoading: summaryLoading } = useCallerContributionSummary();

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

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

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      return;
    }

    let profileImageBytes: Uint8Array | undefined = undefined;

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      profileImageBytes = new Uint8Array(arrayBuffer);
    } else if (userProfile?.profileImage) {
      profileImageBytes = userProfile.profileImage;
    }

    saveProfile(
      {
        name: name.trim(),
        profileImage: profileImageBytes || undefined,
        tokenBalance: userProfile?.tokenBalance || {
          staked: BigInt(0),
          voting: BigInt(0),
          bounty: BigInt(0),
          total: BigInt(0),
        },
        contributionPoints: userProfile?.contributionPoints || {
          city: BigInt(0),
          voting: BigInt(0),
          bounty: BigInt(0),
          token: BigInt(0),
        },
      },
      {
        onSuccess: () => {
          setEditMode(false);
          setImageFile(null);
          setImagePreview(null);
        },
      }
    );
  };

  const handleEditProfile = () => {
    if (userProfile) {
      setName(userProfile.name);
    }
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setName('');
    setImageFile(null);
    setImagePreview(null);
  };

  if (isInitializing || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <HomeHeader />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <BackNav to="/" />
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <HomeHeader />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <BackNav to="/" />
          <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>Please log in to view your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-background">
        <HomeHeader />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <BackNav to="/" />
          <Card className="max-w-md mx-auto mt-8 border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error Loading Profile
              </CardTitle>
              <CardDescription>
                {profileError instanceof Error ? profileError.message : 'Failed to load profile'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-background">
        <HomeHeader />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <BackNav to="/" />
          <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
              <CardTitle>Setup Profile</CardTitle>
              <CardDescription>Please provide your name to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Profile Image (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSaving}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
                  </div>
                )}
              </div>
              <Button onClick={handleSaveProfile} disabled={!name.trim() || isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <BackNav to="/" />
        
        <div className="mt-6 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>{uiCopy.profile.title}</CardTitle>
              <CardDescription>Manage your profile and account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-image">Profile Image (Optional)</Label>
                    <Input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSaving}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={!name.trim() || isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" disabled={isSaving}>
                      {uiCopy.common.cancel}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      imageBytes={userProfile?.profileImage}
                      name={userProfile?.name || 'User'}
                      className="h-16 w-16"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{userProfile?.name}</h3>
                      <p className="text-sm text-muted-foreground">{identity?.getPrincipal().toString()}</p>
                    </div>
                  </div>
                  <Button onClick={handleEditProfile} variant="outline">
                    Edit Profile
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* WSP Token Balance */}
          <Card>
            <CardHeader>
              <CardTitle>Token Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold">{formatTokenAmount(wspBalance || BigInt(0))} WSP</p>
              )}
            </CardContent>
          </Card>

          {/* Contribution Points */}
          <Card>
            <CardHeader>
              <CardTitle>Contribution Points</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">City Points</p>
                    <p className="text-xl font-semibold">{contributionSummary?.totalCityPoints.toString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Voting Points</p>
                    <p className="text-xl font-semibold">{contributionSummary?.totalVotingPoints.toString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bounty Points</p>
                    <p className="text-xl font-semibold">{contributionSummary?.totalBountyPoints.toString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Token Points</p>
                    <p className="text-xl font-semibold">{contributionSummary?.totalTokenPoints.toString() || '0'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staking Section */}
          <div id="staking-section">
            <StakingSection />
          </div>

          {/* Governance Section */}
          <div id="governance-section">
            <GovernanceSection />
          </div>
        </div>
      </div>
    </div>
  );
}
