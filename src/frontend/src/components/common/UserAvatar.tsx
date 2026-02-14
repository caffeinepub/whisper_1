import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useObjectUrl } from '@/hooks/useObjectUrl';

interface UserAvatarProps {
  imageBytes?: Uint8Array | null;
  name?: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * Shared UserAvatar component that handles profile image display with consistent
 * fallback behavior. Uses the shared object-URL hook for memory-safe image rendering.
 */
export function UserAvatar({ imageBytes, name, className, fallbackClassName }: UserAvatarProps) {
  const imageUrl = useObjectUrl(imageBytes);
  const [imageError, setImageError] = useState(false);

  // Generate initials from name
  const getInitials = (displayName: string): string => {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = name || 'User';
  const initials = getInitials(displayName);
  const showImage = imageUrl && !imageError;

  return (
    <Avatar className={className}>
      {showImage && (
        <AvatarImage
          src={imageUrl}
          alt={displayName}
          onError={() => setImageError(true)}
        />
      )}
      <AvatarFallback className={fallbackClassName || 'bg-secondary text-white'}>
        {name ? initials : <User className="h-1/2 w-1/2" />}
      </AvatarFallback>
    </Avatar>
  );
}
