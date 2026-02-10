import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IconBubbleProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'accent' | 'secondary' | 'success' | 'warning' | 'muted';
}

export function IconBubble({ children, className, size = 'md', variant = 'secondary' }: IconBubbleProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const variantClasses = {
    accent: 'bg-accent/20 text-accent border-accent/30',
    secondary: 'bg-secondary/20 text-secondary border-secondary/30',
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    muted: 'bg-muted/20 text-foreground border-muted/30',
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center border backdrop-blur-sm',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
