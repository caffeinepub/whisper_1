import { Button } from '@/components/ui/button';

interface HomeHeaderProps {
  onGetStarted: () => void;
}

export function HomeHeader({ onGetStarted }: HomeHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo Area - Teal styling */}
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-secondary">
            Whisper
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
