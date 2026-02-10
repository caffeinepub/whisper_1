import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

interface HomeHeaderProps {
  onGetStarted: () => void;
}

export function HomeHeader({ onGetStarted }: HomeHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo Area - Teal megaphone with black shadow */}
        <div className="flex items-center gap-3">
          <Volume2 
            className="h-8 w-8 text-secondary" 
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))' }}
          />
          <div 
            className="text-2xl font-bold text-secondary"
            style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
          >
            WHISPER
          </div>
        </div>

        {/* Get Started Button - Teal styling */}
        <Button
          onClick={onGetStarted}
          className="bg-secondary hover:bg-secondary/90 text-white font-semibold"
        >
          Get Started
        </Button>
      </div>
    </header>
  );
}
