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
import { useContributionEventLogger } from '@/hooks/useContributionEventLogger';
import { CONTRIBUTION_ACTION_TYPES } from '@/lib/contributionActionTypes';
import { showEarnedPointsToast } from '@/lib/earnedPointsToast';

interface CreateInstancePlaceholderCardProps {
  onClose: () => void;
  onProposalSubmitted: (instanceName: string) => void;
}

export function CreateInstancePlaceholderCard({ onClose, onProposalSubmitted }: CreateInstancePlaceholderCardProps) {
  const [instanceName, setInstanceName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedState, setSelectedState] = useState<USState | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<USCounty | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<USPlace | null>(null);
  const [countyTouched, setCountyTouched] = useState(false);
  const [placeTouched, setPlaceTouched] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [contributionError, setContributionError] = useState<string | null>(null);

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

    if (countyTouched && !selectedCounty) {
      errors.push('County is required after opening the selector');
    }

    if (placeTouched && !selectedPlace) {
      errors.push('Place is required after opening the selector');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (isNameTaken) {
      setValidationErrors(['Instance name is already taken']);
      return;
    }

    let geographyLevel: USHierarchyLevel;
    let censusBoundaryId: string;
    let squareMeters: bigint;
    let population2020: string;
    let countyName: string;

    if (selectedPlace) {
      geographyLevel = USHierarchyLevel.place;
      censusBoundaryId = selectedPlace.censusCensusFipsCode;
      squareMeters = BigInt(Number(selectedPlace.censusLandKm2) * 1_000_000);
      population2020 = selectedPlace.population ? selectedPlace.population.toString() : '0';
      countyName = selectedPlace.countyFullName;
    } else if (selectedCounty) {
      geographyLevel = USHierarchyLevel.county;
      censusBoundaryId = selectedCounty.fipsCode;
      squareMeters = BigInt(Number(selectedCounty.censusLandAreaSqMeters));
      population2020 = selectedCounty.population2010;
      countyName = selectedCounty.fullName;
    } else if (selectedState) {
      geographyLevel = USHierarchyLevel.state;
      censusBoundaryId = selectedState.fipsCode;
      squareMeters = BigInt(Number(selectedState.censusLandAreaSqMeters));
      population2020 = '0';
      countyName = 'N/A';
    } else {
      setValidationErrors(['Invalid geography selection']);
      return;
    }

    // Clear any previous contribution errors
    setContributionError(null);

    submitProposal(
      {
        description,
        instanceName,
        status: 'Pending',
        state: selectedState!.longName,
        county: countyName,
        geographyLevel,
        censusBoundaryId,
        squareMeters,
        population2020,
      },
      {
        onSuccess: async (result) => {
          // Log contribution event after successful proposal creation
          try {
            const contributionResult = await logContribution.mutateAsync({
              actionType: CONTRIBUTION_ACTION_TYPES.ISSUE_CREATED,
              referenceId: result.instanceName,
              details: 'Instance proposal created',
            });

            // Show earned-points toast immediately if not a duplicate
            if (!contributionResult.isDuplicate) {
              showEarnedPointsToast({
                pointsAwarded: contributionResult.pointsAwarded,
                actionType: contributionResult.actionType,
                origin: 'standard',
                queryClient,
              });
            }
          } catch (error: any) {
            // Don't block the success flow, but show inline message
            const errorMessage = error?.message || 'Could not record contribution points.';
            setContributionError(errorMessage);
            console.warn('Failed to log contribution for proposal creation:', error);
          }

          onProposalSubmitted(result.instanceName);
        },
        onError: (error: any) => {
          setValidationErrors([error.message || 'Failed to submit proposal']);
        },
      }
    );
  };

  const nameAvailable = nameCheckFetched && !isNameTaken && isValidWhisperInstanceName(debouncedInstanceName);
  const nameTaken = nameCheckFetched && isNameTaken;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <IconBubble size="md" variant="secondary">
            <MapPin className="h-5 w-5" />
          </IconBubble>
          <div>
            <CardTitle>{uiCopy.createInstance.title}</CardTitle>
            <CardDescription>{uiCopy.createInstance.getStartedDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="state">{uiCopy.createInstance.stateLabel}</Label>
            <SelectState
              value={selectedState}
              onChange={setSelectedState}
              disabled={isSubmitting}
            />
          </div>

          {selectedState && (
            <div className="space-y-2">
              <Label htmlFor="county">{uiCopy.createInstance.countyLabel}</Label>
              <SelectCounty
                stateGeoId={selectedState.hierarchicalId}
                value={selectedCounty}
                onChange={setSelectedCounty}
                disabled={isSubmitting}
                onOpenChange={handleCountyOpenChange}
              />
            </div>
          )}

          {selectedCounty && (
            <div className="space-y-2">
              <Label htmlFor="place">{uiCopy.createInstance.placeLabel}</Label>
              <SelectPlace
                countyGeoId={selectedCounty.hierarchicalId}
                value={selectedPlace}
                onChange={setSelectedPlace}
                disabled={isSubmitting}
                onOpenChange={handlePlaceOpenChange}
              />
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName">{uiCopy.createInstance.instanceNameLabel}</Label>
            <div className="relative">
              <Input
                id="instanceName"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder={uiCopy.createInstance.instanceNamePlaceholder}
                disabled={isSubmitting}
                className={`pr-10 ${nameTaken ? 'border-destructive' : nameAvailable ? 'border-success' : ''}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingName && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {nameAvailable && <CheckCircle2 className="h-4 w-4 text-success" />}
                {nameTaken && <AlertCircle className="h-4 w-4 text-destructive" />}
              </div>
            </div>
            {nameTaken && (
              <p className="text-sm text-destructive">{uiCopy.createInstance.nameTaken}</p>
            )}
          </div>

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
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                {validationErrors.map((error, index) => (
                  <p key={index} className="text-sm text-destructive">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {contributionError && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-warning">{contributionError}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {uiCopy.createInstance.cancelButton}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || checkingName}>
            {isSubmitting ? (
              <LoadingIndicator label={uiCopy.createInstance.submitting} />
            ) : (
              uiCopy.createInstance.submitButton
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
