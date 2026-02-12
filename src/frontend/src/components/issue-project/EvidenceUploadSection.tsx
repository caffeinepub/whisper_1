import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useContributionEventLogger, type ContributionLogResult } from '@/hooks/useContributionEventLogger';
import { CONTRIBUTION_ACTION_TYPES } from '@/lib/contributionActionTypes';
import { showEarnedPointsToast } from '@/lib/earnedPointsToast';
import { EarnedPointsInlineBadge } from '@/components/common/EarnedPointsInlineBadge';

interface EvidenceUploadSectionProps {
  proposalId: string;
  origin?: 'standard' | 'chat';
}

/**
 * Evidence upload UI section for issue projects that uses blob-storage ExternalBlob
 * representation to produce a stable evidence referenceId and calls useContributionEventLogger
 * with actionType=CONTRIBUTION_ACTION_TYPES.EVIDENCE_ADDED. Handles duplicateContribution
 * as non-fatal and exposes the mutation result for inline earned-points confirmation.
 */
export function EvidenceUploadSection({ proposalId, origin = 'standard' }: EvidenceUploadSectionProps) {
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [contributionResult, setContributionResult] = useState<ContributionLogResult | null>(null);

  const queryClient = useQueryClient();
  const logContribution = useContributionEventLogger();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      setContributionResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !description.trim()) {
      setUploadError('Please provide both a file and description');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setContributionResult(null);

    try {
      // Simulate evidence upload (in a real implementation, this would use ExternalBlob)
      // For now, we'll create a stable referenceId based on proposalId + timestamp
      const timestamp = Date.now();
      const evidenceId = `${proposalId}-evidence-${timestamp}`;

      // Log contribution event
      logContribution.mutate(
        {
          actionType: CONTRIBUTION_ACTION_TYPES.EVIDENCE_ADDED,
          referenceId: evidenceId,
          details: description,
        },
        {
          onSuccess: (result) => {
            setContributionResult(result);
            
            // Show toast only for non-duplicates
            if (!result.isDuplicate) {
              showEarnedPointsToast({
                pointsAwarded: result.pointsAwarded,
                actionType: result.actionType,
                origin,
                queryClient,
              });
            }

            // Reset form
            setDescription('');
            setSelectedFile(null);
            // Reset file input
            const fileInput = document.getElementById('evidence-file-input') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';
            }
          },
          onError: (error) => {
            setUploadError(error.message);
          },
        }
      );
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload evidence');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="evidence-file-input">Upload Evidence</Label>
        <Input
          id="evidence-file-input"
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          accept="image/*,.pdf,.doc,.docx"
        />
        {selectedFile && (
          <p className="text-sm text-muted-foreground">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="evidence-description">Description</Label>
        <Textarea
          id="evidence-description"
          placeholder="Describe the evidence you're uploading..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={handleUpload}
          disabled={isUploading || !selectedFile || !description.trim()}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Evidence
            </>
          )}
        </Button>

        {uploadError && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <EarnedPointsInlineBadge result={contributionResult} />
      </div>
    </div>
  );
}
