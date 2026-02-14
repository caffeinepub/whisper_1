import { useState } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useCallerUserProfile';
import { useWspBalance } from '@/hooks/useWspBalance';
import { useCallerContributionSummary } from '@/hooks/useCallerContributionSummary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Coins, Sparkles, TrendingUp, Award, Zap, Target } from 'lucide-react';
import { LoginButton } from '@/components/common/LoginButton';
import { PageLayout } from '@/components/common/PageLayout';
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
      <PageLayout showBack backTo="/">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout maxWidth="md" showBack backTo="/">
        <Card className="mt-8 border-gray-700 bg-gray-900/70 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Login Required</CardTitle>
            <CardDescription className="text-gray-300">Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginButton />
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (profileError) {
    return (
      <PageLayout maxWidth="md" showBack backTo="/">
        <Card className="mt-8 border-red-700 bg-gray-900/70 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-red-400">
              <AlertCircle className="h-5 w-5" />
              Error Loading Profile
            </CardTitle>
            <CardDescription className="text-gray-300">
              {profileError instanceof Error ? profileError.message : 'Failed to load profile'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline" className="min-h-12 border-gray-600 hover:bg-gray-700 text-white focus-visible:ring-2 focus-visible:ring-cyan-400">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (showProfileSetup) {
    return (
      <PageLayout maxWidth="md" showBack backTo="/">
        <Card className="mt-8 border-gray-700 bg-gray-900/70 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Setup Profile</CardTitle>
            <CardDescription className="text-base text-gray-300">Please provide your name to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium text-gray-200">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={isSaving}
                className="min-h-12 border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image" className="text-base font-medium text-gray-200">Profile Image (Optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isSaving}
                className="min-h-12 border-gray-700 bg-gray-800/50 text-white focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-full object-cover border-2 border-cyan-400/50 shadow-lg" />
                </div>
              )}
            </div>
            <Button onClick={handleSaveProfile} disabled={!name.trim() || isSaving} className="w-full min-h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold text-base shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBack backTo="/">
      <div className="mt-6 space-y-6 pb-8">
        {/* Profile Card */}
        <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-bold text-white">{uiCopy.profile.title}</CardTitle>
            <CardDescription className="text-base text-gray-300">Manage your profile and account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {editMode ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-base font-medium text-gray-200">Name</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isSaving}
                    className="min-h-12 border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-image" className="text-base font-medium text-gray-200">Profile Image (Optional)</Label>
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSaving}
                    className="min-h-12 border-gray-700 bg-gray-800/50 text-white focus-visible:ring-2 focus-visible:ring-cyan-400"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-full object-cover border-2 border-cyan-400/50 shadow-lg" />
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveProfile} disabled={!name.trim() || isSaving} className="min-h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" disabled={isSaving} className="min-h-12 border-gray-600 hover:bg-gray-700 text-gray-200 focus-visible:ring-2 focus-visible:ring-cyan-400">
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <UserAvatar
                    imageBytes={userProfile?.profileImage}
                    name={userProfile?.name || 'User'}
                    className="h-20 w-20 border-2 border-cyan-400/40 shadow-lg"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">{userProfile?.name}</h3>
                    <p className="text-sm text-gray-400 font-mono">
                      {identity?.getPrincipal().toString().slice(0, 10)}...
                    </p>
                  </div>
                </div>
                <Button onClick={handleEditProfile} variant="outline" className="min-h-12 border-gray-600 hover:bg-gray-700 text-gray-200 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400">
                  Edit Profile
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Token Balance Card */}
        <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-cyan-500/30 shadow-lg">
                <Coins className="h-7 w-7 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">WSP Token Balance</CardTitle>
                <CardDescription className="text-base text-gray-300">Your Whisper token holdings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {balanceLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                <span className="text-base font-medium text-gray-300">Loading balance...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <div className="text-6xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                    {formatTokenAmount(wspBalance || BigInt(0))}
                  </div>
                  <span className="text-3xl font-bold text-gray-400">WSP</span>
                  {wspBalance && wspBalance > BigInt(0) && (
                    <Sparkles className="h-6 w-6 text-amber-400 ml-2 animate-pulse" />
                  )}
                </div>
                {(!wspBalance || wspBalance === BigInt(0)) && (
                  <p className="text-base font-medium text-amber-400 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Start earning today!
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contribution Points Card */}
        <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg">
                <Award className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Contribution Points</CardTitle>
                <CardDescription className="text-base text-gray-300">Your earned contribution points by category</CardDescription>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2 italic">Your contributions build stronger communities</p>
          </CardHeader>
          <CardContent className="p-6">
            {summaryLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                <span className="text-base font-medium text-gray-300">Loading points...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City Points - Blue accent */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-l-4 border-blue-500 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    <div className="text-sm font-bold text-blue-400 uppercase tracking-wide">City Points</div>
                  </div>
                  <div className="text-4xl font-bold text-white">{contributionSummary?.totalCityPoints.toString() || '0'}</div>
                  {(!contributionSummary?.totalCityPoints || contributionSummary.totalCityPoints === BigInt(0)) && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span className="text-blue-300">Earn more</span>
                    </p>
                  )}
                </div>

                {/* Voting Points - Purple accent */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-l-4 border-purple-500 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    <div className="text-sm font-bold text-purple-400 uppercase tracking-wide">Voting Points</div>
                  </div>
                  <div className="text-4xl font-bold text-white">{contributionSummary?.totalVotingPoints.toString() || '0'}</div>
                  {(!contributionSummary?.totalVotingPoints || contributionSummary.totalVotingPoints === BigInt(0)) && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span className="text-purple-300">Earn more</span>
                    </p>
                  )}
                </div>

                {/* Bounty Points - Gold accent */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-l-4 border-amber-500 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <div className="text-sm font-bold text-amber-400 uppercase tracking-wide">Bounty Points</div>
                  </div>
                  <div className="text-4xl font-bold text-white">{contributionSummary?.totalBountyPoints.toString() || '0'}</div>
                  {(!contributionSummary?.totalBountyPoints || contributionSummary.totalBountyPoints === BigInt(0)) && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span className="text-amber-300">Earn more</span>
                    </p>
                  )}
                </div>

                {/* Token Points - Green accent */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-l-4 border-green-500 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-5 w-5 text-green-400" />
                    <div className="text-sm font-bold text-green-400 uppercase tracking-wide">Token Points</div>
                  </div>
                  <div className="text-4xl font-bold text-white">{contributionSummary?.totalTokenPoints.toString() || '0'}</div>
                  {(!contributionSummary?.totalTokenPoints || contributionSummary.totalTokenPoints === BigInt(0)) && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span className="text-green-300">Earn more</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staking Section */}
        <StakingSection />

        {/* Governance Section */}
        <GovernanceSection />
      </div>
    </PageLayout>
  );
}
