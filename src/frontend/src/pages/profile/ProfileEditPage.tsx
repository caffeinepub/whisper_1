import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Upload, X, Loader2, Trash2 } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useCallerUserProfile';
import { useRequestDeletion } from '@/hooks/useAccountDeletion';
import { LoginButton } from '@/components/common/LoginButton';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { uiCopy } from '@/lib/uiCopy';
import { toast } from 'sonner';
import { spaNavigate } from '@/utils/spaNavigate';
import { getProfileLocalState, saveProfileLocalState } from './profileLocalState';

export default function ProfileEditPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();
  const deletionMutation = useRequestDeletion();

  const isAuthenticated = !!identity;

  // Backend-supported fields
  const [name, setName] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | undefined>(undefined);
  const [removeImage, setRemoveImage] = useState(false);

  // Local-only fields
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [externalLinks, setExternalLinks] = useState<string[]>(['', '', '']);

  // Load profile data
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      
      // Load profile image if exists
      if (userProfile.profileImage && !removeImage) {
        const imageUrl = getImageUrl(userProfile.profileImage);
        setProfileImagePreview(imageUrl);
      }
    }

    // Load local-only fields
    const localState = getProfileLocalState();
    setBio(localState.bio);
    setUsername(localState.username);
    setLocation(localState.location);
    setExternalLinks(localState.externalLinks.length > 0 ? localState.externalLinks : ['', '', '']);
  }, [userProfile, removeImage]);

  const handleBackToProfile = () => {
    spaNavigate('/profile');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(uiCopy.profile.imageInvalidType);
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(uiCopy.profile.imageTooLarge);
      return;
    }

    setProfileImageFile(file);
    setRemoveImage(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(undefined);
    setRemoveImage(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(uiCopy.profile.nameRequired);
      return;
    }

    try {
      // Prepare profile image bytes
      let profileImageBytes: Uint8Array | undefined = undefined;

      if (removeImage) {
        // Explicitly remove image by setting to undefined
        profileImageBytes = undefined;
      } else if (profileImageFile) {
        // New image uploaded
        const arrayBuffer = await profileImageFile.arrayBuffer();
        profileImageBytes = new Uint8Array(arrayBuffer);
      } else if (userProfile?.profileImage) {
        // Keep existing image
        profileImageBytes = userProfile.profileImage instanceof Uint8Array 
          ? userProfile.profileImage 
          : new Uint8Array(userProfile.profileImage);
      }

      // Save backend-supported fields
      await saveMutation.mutateAsync({
        name: name.trim(),
        profileImage: profileImageBytes,
      });

      // Save local-only fields
      const filteredLinks = externalLinks.filter(link => link.trim() !== '');
      saveProfileLocalState({
        bio: bio.trim(),
        username: username.trim(),
        location: location.trim(),
        externalLinks: filteredLinks,
      });

      toast.success(uiCopy.profile.saveSuccess);
      spaNavigate('/profile');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error(uiCopy.profile.saveError);
    }
  };

  const handleRequestDeletion = async () => {
    try {
      await deletionMutation.mutateAsync();
      toast.success('Deletion request submitted. An admin will review your request.');
      spaNavigate('/profile');
    } catch (error) {
      console.error('Failed to request deletion:', error);
      toast.error('Failed to submit deletion request. Please try again.');
    }
  };

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

  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
            <Button variant="outline" onClick={handleBackToProfile} className="w-full">
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

  const initials = getInitials(name || 'User');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToProfile}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {uiCopy.common.back}
          </Button>
          <h1 className="text-lg font-semibold">{uiCopy.profile.editProfile}</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Edit Form */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{uiCopy.profile.editProfile}</CardTitle>
            <CardDescription>{uiCopy.profile.pageDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                {profileImagePreview && <AvatarImage src={profileImagePreview} alt={name} />}
                <AvatarFallback className="bg-secondary text-white text-2xl font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {profileImagePreview ? uiCopy.profile.changeImage : uiCopy.profile.uploadImage}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {profileImagePreview && (
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage}>
                    <X className="mr-2 h-4 w-4" />
                    {uiCopy.profile.removeImage}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{uiCopy.profile.imageHelper}</p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{uiCopy.profile.nameLabel}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={uiCopy.profile.namePlaceholder}
              />
            </div>

            {/* Username (local only) */}
            <div className="space-y-2">
              <Label htmlFor="username">Username (optional)</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
              />
              <p className="text-xs text-muted-foreground">Stored locally only</p>
            </div>

            {/* Bio (local only) */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Stored locally only</p>
            </div>

            {/* Location (local only) */}
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
              />
              <p className="text-xs text-muted-foreground">Stored locally only</p>
            </div>

            {/* External Links (local only) */}
            <div className="space-y-2">
              <Label>External Links (optional)</Label>
              {externalLinks.map((link, index) => (
                <Input
                  key={index}
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...externalLinks];
                    newLinks[index] = e.target.value;
                    setExternalLinks(newLinks);
                  }}
                  placeholder={`Link ${index + 1}`}
                />
              ))}
              <p className="text-xs text-muted-foreground">Stored locally only</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uiCopy.profile.saving}
                  </>
                ) : (
                  uiCopy.profile.saveButton
                )}
              </Button>

              <Button variant="outline" onClick={handleBackToProfile} className="w-full">
                {uiCopy.common.cancel}
              </Button>

              {/* Delete Account Section */}
              <div className="pt-6 border-t border-border">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Request Account Deletion
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Request Account Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will submit a request to delete your account. An admin will review and process your request. This action cannot be undone once approved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRequestDeletion}
                        disabled={deletionMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Request'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
