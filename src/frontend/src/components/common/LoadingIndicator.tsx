import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Shared loading indicator component with spinner and optional label.
 * Provides consistent styling across availability checking, proposal submission,
 * and proposals loading/refetching.
 */
export function LoadingIndicator({ label = 'Loading...', size = 'md', className = '' }: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-secondary`} />
      <span className={`${textSizeClasses[size]} text-white/70 font-medium`}>{label}</span>
    </div>
  );
}
