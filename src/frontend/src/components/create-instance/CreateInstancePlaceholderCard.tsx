import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Loader2, X, MapPin } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { IconBubble } from '@/components/common/IconBubble';
import { SelectState } from './SelectState';
import { SelectCounty } from './SelectCounty';
import { SelectPlace } from './SelectPlace';
import { useCheckInstanceName, useSubmitProposal } from '@/hooks/useCreateInstanceProposal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { generateWhisperInstanceName, isValidWhisperInstanceName } from '@/lib/whisperInstanceNaming';
import { uiCopy } from '@/lib/uiCopy';
import { USHierarchyLevel, type USState, type USCounty, type USPlace } from '@/backend';
import { useContributionEventLogger, type ContributionLogResult } from '@/hooks/useContributionEventLogger';
import { CONTRIBUTION_ACTION_TYPES } from '@/lib/contributionActionTypes';
import { showEarnedPointsToast } from '@/lib/earnedPointsToast';
import { EarnedPointsInlineBadge } from '@/components/common/EarnedPointsInlineBadge';

interface CreateInstancePlaceholderCardProps {
  onClose: () => void;
  onProposalSubmitted: (instanceName: string) => void;
  origin?: 'standard' | 'chat';
}

export function CreateInstancePlaceholderCard({ 
  onClose, 
  onProposalSubmitted,
  origin = 'standard'
}: CreateInstancePlaceholderCardProps) {
  const [instanceName, setInstanceName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedState, setSelectedState] = useState<USState | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<USCounty | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<USPlace | null>(null);
  const [countyTouched, setCountyTouched] = useState(false);
  const [placeTouched, setPlaceTouched] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [contributionError, setContributionError] = useState<string | null>(null);
  const [contributionResult, setContributionResult] = useState<ContributionLogResult | null>(null);

  const queryClient = useQueryClient();
  const debouncedInstanceName = useDebouncedValue(instanceName, 500);

  const {
    data: isNameTaken,
    isLoading: checkingName,
    isFetched: nameCheckFetched,
  } = useCheckInstanceName(debouncedInstanceName);

  const { mutate: submitProposal, isPending: isSubmitting } = useSubmitProposal();
  const logContribution = useContributionEventLogger();

  // Auto-generate instance name when geography changes
  useEffect(() => {
    if (selectedState) {
      try {
        let generatedName = '';
        if (selectedPlace) {
          generatedName = generateWhisperInstanceName(USHierarchyLevel.place, selectedState.longName, selectedCounty?.fullName, selectedPlace.shortName);
        } else if (selectedCounty) {
          generatedName = generateWhisperInstanceName(USHierarchyLevel.county, selectedState.longName, selectedCounty.fullName);
        } else {
          generatedName = generateWhisperInstanceName(USHierarchyLevel.state, selectedState.longName);
        }
        setInstanceName(generatedName);
      } catch (error) {
        console.error('Error generating instance name:', error);
      }
    }
  }, [selectedState, selectedCounty, selectedPlace]);

  useEffect(() => {
    setSelectedCounty(null);
    setSelectedPlace(null);
    setCountyTouched(false);
    setPlaceTouched(false);
  }, [selectedState]);

  useEffect(() => {
    setSelectedPlace(null);
    setPlaceTouched(false);
  }, [selectedCounty]);

  const handleCountyOpenChange = (open: boolean) => {
    if (open) {
      setCountyTouched(true);
    }
  };

  const handlePlaceOpenChange = (open: boolean) => {
    if (open) {
      setPlaceTouched(true);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!instanceName.trim()) {
      errors.push('Instance name is required');
    } else if (!isValidWhisperInstanceName(instanceName)) {
      errors.push('Instance name must start with "WHISPER-"');
    }

    if (!description.trim()) {
      errors.push('Description is required');
    }

    if (!selectedState) {
      errors.push('State is required');
    }

    if (!selectedCounty) {
      errors.push('County is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = () => {
    setContributionError(null);
    setContributionResult(null);

    if (!validateForm()) {
      return;
    }

    if (!selectedState || !selectedCounty) {
      return;
    }

    const geographyLevel = selectedPlace ? USHierarchyLevel.place : USHierarchyLevel.county;
    const censusBoundaryId = selectedPlace?.hierarchicalId || selectedCounty.hierarchicalId;
    const squareMeters = selectedPlace
      ? Number(selectedPlace.censusLandKm2) * 1_000_000
      : parseInt(selectedCounty.censusLandAreaSqMeters, 10);
    const population2020 = selectedPlace?.population?.toString() || selectedCounty.population2010;

    submitProposal(
      {
        description,
        instanceName,
        status: 'Pending',
        state: selectedState.longName,
        county: selectedCounty.fullName,
        geographyLevel,
        censusBoundaryId,
        squareMeters: BigInt(squareMeters),
        population2020,
      },
      {
        onSuccess: (data) => {
          const createdInstanceName = data.instanceName;

          // Log contribution event with non-empty referenceId
          logContribution.mutate(
            {
              actionType: CONTRIBUTION_ACTION_TYPES.ISSUE_CREATED,
              referenceId: createdInstanceName,
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

                // Navigate to the created proposal
                onProposalSubmitted(createdInstanceName);
              },
              onError: (error) => {
                // Non-blocking: show inline error but don't prevent navigation
                setContributionError(error.message);
                console.error('Contribution logging failed (non-blocking):', error);

                // Still navigate to the created proposal
                onProposalSubmitted(createdInstanceName);
              },
            }
          );
        },
        onError: (error: any) => {
          setValidationErrors([error.message || 'Failed to submit proposal']);
        },
      }
    );
  };

  const showNameAvailability = debouncedInstanceName && nameCheckFetched && isValidWhisperInstanceName(debouncedInstanceName);
  const nameIsAvailable = showNameAvailability && !isNameTaken;
  const nameIsTaken = showNameAvailability && isNameTaken;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <IconBubble variant="secondary" size="lg">
            <MapPin className="h-5 w-5" />
          </IconBubble>
          <div>
            <CardTitle>{uiCopy.createInstance.title}</CardTitle>
            <CardDescription>{uiCopy.createInstance.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6 space-y-6">
        {/* Geography Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="state-select">{uiCopy.createInstance.stateLabel}</Label>
            <SelectState
              value={selectedState}
              onChange={setSelectedState}
              disabled={isSubmitting}
            />
          </div>

          {selectedState && (
            <div className="space-y-2">
              <Label htmlFor="county-select">{uiCopy.createInstance.countyLabel}</Label>
              <SelectCounty
                stateGeoId={selectedState.hierarchicalId}
                value={selectedCounty}
                onChange={setSelectedCounty}
                onOpenChange={handleCountyOpenChange}
                disabled={isSubmitting}
              />
            </div>
          )}

          {selectedState && selectedCounty && countyTouched && (
            <div className="space-y-2">
              <Label htmlFor="place-select">{uiCopy.createInstance.placeLabel}</Label>
              <SelectPlace
                countyGeoId={selectedCounty.hierarchicalId}
                value={selectedPlace}
                onChange={setSelectedPlace}
                onOpenChange={handlePlaceOpenChange}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        {/* Instance Name */}
        <div className="space-y-2">
          <Label htmlFor="instance-name">{uiCopy.createInstance.instanceNameLabel}</Label>
          <Input
            id="instance-name"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            placeholder={uiCopy.createInstance.instanceNamePlaceholder}
            disabled={isSubmitting}
          />
          {checkingName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Checking availability...</span>
            </div>
          )}
          {nameIsAvailable && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Name is available</span>
            </div>
          )}
          {nameIsTaken && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Name is already taken</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">{uiCopy.createInstance.descriptionLabel}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={uiCopy.createInstance.descriptionPlaceholder}
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="space-y-2">
            {validationErrors.map((error, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}

        {/* Contribution Error (non-blocking) */}
        {contributionError && (
          <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Note: {contributionError}</span>
          </div>
        )}

        {/* Earned Points Badge */}
        <EarnedPointsInlineBadge result={contributionResult} />

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || nameIsTaken || checkingName}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uiCopy.createInstance.submitting}
            </>
          ) : (
            uiCopy.createInstance.submitButton
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
