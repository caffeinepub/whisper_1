import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useCallerUserProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { uiCopy } from '@/lib/uiCopy';

interface UserProfileMenuProps {
  onNavigate: (path: string) => void;
}

export function UserProfileMenu({ onNavigate }: UserProfileMenuProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleProfileClick = () => {
    onNavigate('/profile');
  };

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

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </Button>
    );
  }

  const displayName = userProfile?.name || 'User';
  const initials = getInitials(displayName);
  const imageUrl = userProfile?.profileImage ? getImageUrl(userProfile.profileImage) : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent/10">
          <Avatar className="h-8 w-8">
            {imageUrl && <AvatarImage src={imageUrl} alt={displayName} />}
            <AvatarFallback className="bg-secondary text-white text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium text-white">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          {uiCopy.profile.title}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          {uiCopy.auth.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
