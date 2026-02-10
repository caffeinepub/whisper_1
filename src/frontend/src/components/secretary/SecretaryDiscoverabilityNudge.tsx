import { MessageCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconBubble } from '@/components/common/IconBubble';

interface SecretaryDiscoverabilityNudgeProps {
  onOpenSecretary: () => void;
  onDismiss: () => void;
}

export function SecretaryDiscoverabilityNudge({ onOpenSecretary, onDismiss }: SecretaryDiscoverabilityNudgeProps) {
  return (
    <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow rounded-2xl relative">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 rounded-full p-1"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <IconBubble size="lg" variant="secondary">
            <MessageCircle className="h-6 w-6" />
          </IconBubble>
          <CardTitle className="text-2xl text-white">Meet Secretary</CardTitle>
        </div>
        <CardDescription className="text-white/70">
          Your AI assistant for navigating Whisper. Ask questions, get help, or jump to any feature instantly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onOpenSecretary}
          className="bg-secondary hover:bg-secondary/90 text-white font-semibold"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Try Secretary Now
        </Button>
      </CardContent>
    </Card>
  );
}
