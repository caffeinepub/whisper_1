import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';

interface SecretaryDiscoverabilityNudgeProps {
  onOpenSecretary: () => void;
  onDismiss: () => void;
}

export function SecretaryDiscoverabilityNudge({
  onOpenSecretary,
  onDismiss,
}: SecretaryDiscoverabilityNudgeProps) {
  return (
    <Card className="border-accent/50 shadow-md bg-accent/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CardContent className="p-4 flex items-start gap-3">
        <MessageCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Need help getting started?
          </p>
          <p className="text-sm text-muted-foreground">
            Click Secretary to explore what you can do on Whisper.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={onOpenSecretary}
            className="mt-2"
          >
            Open Secretary
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="h-8 w-8 flex-shrink-0"
          aria-label="Dismiss greeting"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
