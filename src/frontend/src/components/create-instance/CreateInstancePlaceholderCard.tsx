import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useCheckInstanceName, useSubmitProposal } from '@/hooks/useCreateInstanceProposal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface CreateInstancePlaceholderCardProps {
  onClose: () => void;
}

type Scope = 'city' | 'county' | 'state' | 'national';

export function CreateInstancePlaceholderCard({ onClose }: CreateInstancePlaceholderCardProps) {
  const [scope, setScope] = useState<Scope>('city');
  const [instanceName, setInstanceName] = useState('');
  const [parentReference, setParentReference] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Debounce the instance name to avoid excessive backend calls
  const debouncedInstanceName = useDebouncedValue(instanceName, 500);

  // Check if instance name is taken
  const { data: isNameTaken, isLoading: isCheckingName } = useCheckInstanceName(debouncedInstanceName);

  // Submit proposal mutation
  const submitProposal = useSubmitProposal();

  // Clear submission error when instance name changes
  useEffect(() => {
    if (submitProposal.isError) {
      submitProposal.reset();
    }
  }, [instanceName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!instanceName.trim()) {
      return;
    }

    if (isNameTaken) {
      return;
    }

    try {
      // Build description from form data
      const description = `Create ${scope} instance: ${instanceName}${parentReference ? ` (parent: ${parentReference})` : ''}`;

      await submitProposal.mutateAsync({
        description,
        instanceName: instanceName.trim(),
        status: 'pending',
      });

      setShowSuccess(true);
    } catch (error) {
      // Error is handled by React Query mutation state
      console.error('Error submitting proposal:', error);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    submitProposal.reset();
    onClose();
  };

  // Show success state
  if (showSuccess) {
    return (
      <Card className="border-success shadow-md bg-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Proposal Submitted Successfully
              </CardTitle>
              <CardDescription>
                Your instance creation proposal has been recorded
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-success/50 bg-success/5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription>
              Your proposal for <span className="font-medium">{instanceName}</span> has been submitted.
              The community will review your proposal in the next development phase.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={handleClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show form
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
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Scope Selection */}
          <div className="space-y-2">
            <Label htmlFor="scope">Scope *</Label>
            <Select value={scope} onValueChange={(value) => setScope(value as Scope)}>
              <SelectTrigger id="scope">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="county">County</SelectItem>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="national">National</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the jurisdiction level for your instance
            </p>
          </div>

          {/* Instance Name */}
          <div className="space-y-2">
            <Label htmlFor="instanceName">Instance Name *</Label>
            <Input
              id="instanceName"
              type="text"
              placeholder="e.g., WhisperDavenport-IA"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              required
            />
            {/* Name availability indicator */}
            {debouncedInstanceName.trim() && (
              <div className="flex items-center gap-2 text-xs">
                {isCheckingName ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Checking availability...</span>
                  </>
                ) : isNameTaken ? (
                  <>
                    <AlertCircle className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">This name is already taken</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="text-success">Name is available</span>
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Choose a unique name for your instance
            </p>
          </div>

          {/* Parent Reference (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="parentReference">Parent Installation Reference (Optional)</Label>
            <Input
              id="parentReference"
              type="text"
              placeholder="e.g., WhisperScottCounty-IA"
              value={parentReference}
              onChange={(e) => setParentReference(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Reference the parent jurisdiction if applicable (e.g., city → county)
            </p>
          </div>

          {/* Submission Error Alert */}
          {submitProposal.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {submitProposal.error instanceof Error 
                  ? submitProposal.error.message 
                  : 'Failed to submit proposal. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Duplicate Name Error (pre-check) */}
          {isNameTaken && instanceName.trim() && !isCheckingName && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The instance name "{instanceName}" is already in use. Please choose a different name.
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !instanceName.trim() ||
                isNameTaken ||
                isCheckingName ||
                submitProposal.isPending
              }
            >
              {submitProposal.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Proposal'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
