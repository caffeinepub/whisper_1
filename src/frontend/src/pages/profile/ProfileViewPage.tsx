import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, MapPin, Calendar, Award, ExternalLink, Activity } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useCallerUserProfile';
import { LoginButton } from '@/components/common/LoginButton';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { uiCopy } from '@/lib/uiCopy';
import { spaNavigate } from '@/utils/spaNavigate';
import { getProfileLocalState } from './profileLocalState';

export default function ProfileViewPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  const handleBackToHome = () => {
    spaNavigate('/');
  };

  const handleEditProfile = () => {
    spaNavigate('/profile/edit');
  };

  // Get local-only fields
  const localState = getProfileLocalState();

  // Generate initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Convert profile image bytes to blob URL
  const getImageUrl = (imageBytes: Uint8Array | number[] | undefined): string | undefined => {
    if (!imageBytes) return undefined;
    try {
      const bytes = imageBytes instanceof Uint8Array ? imageBytes : new Uint8Array(imageBytes);
      const properBytes = new Uint8Array(bytes);
      const blob = new Blob([properBytes], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to create image URL:', error);
      return undefined;
    }
  };

  // Auth required state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{uiCopy.auth.loginPrompt}</CardTitle>
            <CardDescription>{uiCopy.auth.loginDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginButton />
            <Button variant="outline" onClick={handleBackToHome} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {uiCopy.common.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingIndicator label="Loading profile..." />
      </div>
    );
  }

  const displayName = userProfile?.name || 'User';
  const initials = getInitials(displayName);
  const imageUrl = userProfile?.profileImage ? getImageUrl(userProfile.profileImage) : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToHome}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {uiCopy.common.back}
          </Button>
          <h1 className="text-lg font-semibold">{uiCopy.profile.title}</h1>
          <Button onClick={handleEditProfile}>
            <Edit className="mr-2 h-4 w-4" />
            {uiCopy.profile.editProfile}
          </Button>
        </div>
      </header>

      {/* Profile Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                {imageUrl && <AvatarImage src={imageUrl} alt={displayName} />}
                <AvatarFallback className="bg-secondary text-white text-2xl font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{displayName}</CardTitle>
                {localState.username && (
                  <p className="text-sm text-muted-foreground mt-1">@{localState.username}</p>
                )}
              </div>
              {localState.role && (
                <Badge variant="secondary" className="mt-2">
                  {localState.role}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Bio Section */}
            {localState.bio && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Bio</h3>
                  <p className="text-sm">{localState.bio}</p>
                </div>
                <Separator />
              </>
            )}

            {/* Location & Join Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localState.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">Location</h3>
                    <p className="text-sm">{localState.location}</p>
                  </div>
                </div>
              )}
              {localState.joinDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">Member Since</h3>
                    <p className="text-sm">{localState.joinDate}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contribution Stats */}
            {(localState.stats.issuesReported > 0 || 
              localState.stats.projectsParticipated > 0 || 
              localState.stats.resolutionsHelped > 0 || 
              localState.stats.wspEarned > 0) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Contribution Stats
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-secondary">{localState.stats.issuesReported}</p>
                      <p className="text-xs text-muted-foreground mt-1">Issues Reported</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-secondary">{localState.stats.projectsParticipated}</p>
                      <p className="text-xs text-muted-foreground mt-1">Projects</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-secondary">{localState.stats.resolutionsHelped}</p>
                      <p className="text-xs text-muted-foreground mt-1">Resolutions</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-secondary">{localState.stats.wspEarned}</p>
                      <p className="text-xs text-muted-foreground mt-1">WSP Earned</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Recent Activity */}
            {localState.recentActivity.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Activity
                  </h3>
                  <ul className="space-y-2">
                    {localState.recentActivity.map((activity, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* External Links */}
            {localState.externalLinks.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {localState.externalLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-secondary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {new URL(link).hostname}
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Achievements/Badges */}
            {localState.achievements.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {localState.achievements.map((achievement, index) => (
                      <Badge key={index} variant="outline">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
