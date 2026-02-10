import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { IconBubble } from '@/components/common/IconBubble';
import { uiCopy } from '@/lib/uiCopy';

interface SecretaryDiscoverabilityNudgeProps {
  onDismiss: () => void;
  onOpen: () => void;
}

export function SecretaryDiscoverabilityNudge({ onDismiss, onOpen }: SecretaryDiscoverabilityNudgeProps) {
  return (
    <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow relative">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>
      
      <CardHeader>
        <div className="flex items-center gap-3">
          <IconBubble size="lg" variant="secondary">
            <MessageCircle className="h-6 w-6" />
          </IconBubble>
          <div>
            <CardTitle className="text-white">{uiCopy.secretary.nudgeTitle}</CardTitle>
            <CardDescription className="text-white/70">
              {uiCopy.secretary.nudgeDescription}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Button
          onClick={onOpen}
          className="bg-secondary hover:bg-secondary/90 text-white font-semibold border-secondary focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {uiCopy.secretary.nudgeButton}
        </Button>
      </CardContent>
    </Card>
  );
}
