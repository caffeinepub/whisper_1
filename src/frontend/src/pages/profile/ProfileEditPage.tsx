import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useCallerUserProfile';
import { LoginButton } from '@/components/common/LoginButton';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { uiCopy } from '@/lib/uiCopy';
import { toast } from 'sonner';
import { spaNavigate } from '@/utils/spaNavigate';
import { getProfileLocalState, saveProfileLocalState } from './profileLocalState';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function ProfileEditPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<Uint8Array | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [externalLink1, setExternalLink1] = useState('');
  const [externalLink2, setExternalLink2] = useState('');
  const [externalLink3, setExternalLink3] = useState('');

  const isAuthenticated = !!identity;

  // Initialize form with existing data
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      if (userProfile.profileImage) {
        const blob = new Blob([new Uint8Array(userProfile.profileImage)], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setImagePreview(url);
        setProfileImage(new Uint8Array(userProfile.profileImage));
      }
    }

    // Load local-only fields
    const localState = getProfileLocalState();
    setBio(localState.bio);
    if (localState.externalLinks.length > 0) {
      setExternalLink1(localState.externalLinks[0] || '');
      setExternalLink2(localState.externalLinks[1] || '');
      setExternalLink3(localState.externalLinks[2] || '');
    }
  }, [userProfile]);

  // Cleanup image preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleBackToProfile = () => {
    spaNavigate('/profile');
  };

  const handleCancel = () => {
    spaNavigate('/profile');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(uiCopy.profile.imageInvalidType);
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(uiCopy.profile.imageTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      setProfileImage(bytes);

      // Create preview URL
      const blob = new Blob([bytes], { type: file.type });
      const url = URL.createObjectURL(blob);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(url);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(uiCopy.profile.nameRequired);
      return;
    }

    try {
      // Save backend-supported fields (name + avatar)
      await saveMutation.mutateAsync({
        name: name.trim(),
        profileImage: profileImage || undefined,
      });

      // Save local-only fields
      const links = [externalLink1, externalLink2, externalLink3].filter(link => link.trim() !== '');
      saveProfileLocalState({
        bio: bio.trim(),
        externalLinks: links,
      });

      toast.success(uiCopy.profile.saveSuccess);
      spaNavigate('/profile');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error(uiCopy.profile.saveError);
    }
  };

  // Generate initials from name
  const getInitials = (name: string): string => {
    if (!name.trim()) return 'U';
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
            <Button variant="outline" onClick={() => spaNavigate('/')} className="w-full">
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

  const initials = getInitials(name);

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
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                {imagePreview && <AvatarImage src={imagePreview} alt={name} />}
                <AvatarFallback className="bg-secondary text-white text-2xl font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {imagePreview ? uiCopy.profile.changeImage : uiCopy.profile.uploadImage}
                    </span>
                  </Button>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {imagePreview && (
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage}>
                    <X className="mr-2 h-4 w-4" />
                    {uiCopy.profile.removeImage}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">{uiCopy.profile.imageHelper}</p>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">{uiCopy.profile.nameLabel}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={uiCopy.profile.namePlaceholder}
                maxLength={100}
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself (150-300 characters)"
                maxLength={300}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">{bio.length}/300 characters</p>
            </div>

            {/* External Links */}
            <div className="space-y-4">
              <Label>External Links (Optional, max 3)</Label>
              <div className="space-y-2">
                <Input
                  value={externalLink1}
                  onChange={(e) => setExternalLink1(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                />
                <Input
                  value={externalLink2}
                  onChange={(e) => setExternalLink2(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                />
                <Input
                  value={externalLink3}
                  onChange={(e) => setExternalLink3(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1"
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
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saveMutation.isPending}
                className="flex-1"
              >
                {uiCopy.common.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
