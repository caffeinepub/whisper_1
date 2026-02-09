import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, MapPin, Building2, Map } from 'lucide-react';

interface CreateInstancePlaceholderCardProps {
  onClose: () => void;
}

export function CreateInstancePlaceholderCard({ onClose }: CreateInstancePlaceholderCardProps) {
  return (
    <Card className="border-accent shadow-md bg-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Create Instance</CardTitle>
            <CardDescription>
              Start a new Whisper instance for your community
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Instance creation will be implemented in the next development step. An{' '}
            <span className="font-medium text-foreground">instance</span> is a jurisdiction-specific
            Whisper site that enables civic accountability at different levels:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
              <Building2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">City Level</p>
                <p className="text-xs text-muted-foreground">
                  Example: WhisperDavenport-IA for local issues like potholes, parks, and city
                  services
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
              <Map className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">County Level</p>
                <p className="text-xs text-muted-foreground">
                  Example: WhisperScottCounty-IA for regional concerns like roads, health services,
                  and county governance
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
              <MapPin className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">State Level</p>
                <p className="text-xs text-muted-foreground">
                  Example: WhisperIowa for statewide issues like legislation, education, and state
                  agencies
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Each instance will connect to its parent jurisdiction, allowing issues to escalate
              from city to county to state as needed. Citizens will be able to report problems,
              collaborate on solutions, and track progress in their community.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Got it
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
