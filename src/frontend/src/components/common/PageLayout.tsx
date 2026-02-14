import { ReactNode } from 'react';
import { HomeHeader } from './HomeHeader';
import { BackNav } from './BackNav';

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: 'md' | '4xl';
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
  onBackClick?: () => void;
}

export function PageLayout({ 
  children, 
  maxWidth = '4xl',
  showBack = false,
  backTo,
  backLabel = 'Back',
  onBackClick
}: PageLayoutProps) {
  const maxWidthClass = maxWidth === 'md' ? 'max-w-md' : 'max-w-4xl';

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      <div className={`container mx-auto px-4 pt-24 pb-12 ${maxWidthClass}`}>
        {showBack && (
          <BackNav to={backTo} label={backLabel} onClick={onBackClick} />
        )}
        {children}
      </div>
    </div>
  );
}
