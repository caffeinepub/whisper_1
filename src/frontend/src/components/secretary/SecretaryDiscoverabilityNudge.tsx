import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Sparkles } from 'lucide-react';

interface SecretaryDiscoverabilityNudgeProps {
  onOpenSecretary: () => void;
  onDismiss: () => void;
}

export function SecretaryDiscoverabilityNudge({
  onOpenSecretary,
  onDismiss,
}: SecretaryDiscoverabilityNudgeProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-accent/50 shadow-glow hover-lift rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg text-accent">Meet Your AI Secretary</CardTitle>
              <CardDescription className="text-sm">
                Get instant help with civic issues and navigation
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-8 w-8 rounded-lg"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Your AI Secretary can help you report issues, track status, access resources, and navigate the platform.
        </p>
        <Button
          onClick={onOpenSecretary}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-medium"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Start Conversation
        </Button>
      </CardContent>
    </Card>
  );
}
