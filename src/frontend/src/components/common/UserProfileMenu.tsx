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
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
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

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </Button>
    );
  }

  const displayName = userProfile?.name || 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent/10">
          <UserAvatar
            imageBytes={userProfile?.profileImage}
            name={displayName}
            className="h-8 w-8"
            fallbackClassName="bg-secondary text-white text-xs font-medium"
          />
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
