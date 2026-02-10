import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Loader2, X, MapPin } from 'lucide-react';
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

  const debouncedInstanceName = useDebouncedValue(instanceName, 500);

  const {
    data: isNameTaken,
    isLoading: checkingName,
    isFetched: nameCheckFetched,
  } = useCheckInstanceName(debouncedInstanceName);

  const { mutate: submitProposal, isPending: isSubmitting } = useSubmitProposal();

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
      squareMeters = BigInt(selectedCounty.censusLandAreaSqMeters);
      population2020 = selectedCounty.population2010;
      countyName = selectedCounty.fullName;
    } else if (selectedState) {
      geographyLevel = USHierarchyLevel.state;
      censusBoundaryId = selectedState.fipsCode;
      squareMeters = selectedState.censusLandAreaSqMeters;
      population2020 = '0';
      countyName = 'N/A';
    } else {
      setValidationErrors(['Invalid geography selection']);
      return;
    }

    submitProposal(
      {
        description,
        instanceName,
        status: 'Pending',
        state: selectedState?.longName || '',
        county: countyName,
        geographyLevel,
        censusBoundaryId,
        squareMeters,
        population2020,
      },
      {
        onSuccess: () => {
          onProposalSubmitted(instanceName);
          onClose();
        },
        onError: (error: any) => {
          if (error?.message) {
            setValidationErrors([error.message]);
          } else {
            setValidationErrors(['Failed to submit proposal. Please try again.']);
          }
        },
      }
    );
  };

  const isNameAvailable = nameCheckFetched && !isNameTaken && debouncedInstanceName.length > 0 && isValidWhisperInstanceName(debouncedInstanceName);
  const showNameTaken = nameCheckFetched && isNameTaken;
  const showInvalidFormat = debouncedInstanceName.length > 0 && !isValidWhisperInstanceName(debouncedInstanceName);

  return (
    <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBubble size="md" variant="secondary">
              <MapPin className="h-5 w-5" />
            </IconBubble>
            <div>
              <CardTitle className="text-white">{uiCopy.createInstance.title}</CardTitle>
              <CardDescription className="text-white/60">{uiCopy.createInstance.description}</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10"
            aria-label={uiCopy.common.close}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {validationErrors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="state" className="text-white">
              {uiCopy.createInstance.stateLabel}
            </Label>
            <SelectState
              value={selectedState}
              onChange={setSelectedState}
              disabled={isSubmitting}
            />
          </div>

          {selectedState && (
            <div className="space-y-2">
              <Label htmlFor="county" className="text-white">
                {uiCopy.createInstance.countyLabel}
              </Label>
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
              <Label htmlFor="place" className="text-white">
                {uiCopy.createInstance.placeLabel}
              </Label>
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

        <Separator className="bg-white/10" />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName" className="text-white">
              {uiCopy.createInstance.instanceNameLabel}
            </Label>
            <div className="relative">
              <Input
                id="instanceName"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder={uiCopy.createInstance.instanceNamePlaceholder}
                disabled={isSubmitting}
                className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10 ${
                  showNameTaken || showInvalidFormat ? 'border-destructive' : isNameAvailable ? 'border-success' : ''
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingName && <Loader2 className="h-4 w-4 animate-spin text-white/40" />}
                {!checkingName && isNameAvailable && <CheckCircle2 className="h-4 w-4 text-success" />}
                {!checkingName && (showNameTaken || showInvalidFormat) && <AlertCircle className="h-4 w-4 text-destructive" />}
              </div>
            </div>
            <p className="text-xs text-white/60">{uiCopy.createInstance.whisperNamingHelper}</p>
            {checkingName && <p className="text-xs text-white/60">{uiCopy.createInstance.checkingAvailability}</p>}
            {!checkingName && isNameAvailable && <p className="text-xs text-success">{uiCopy.createInstance.nameAvailable}</p>}
            {!checkingName && showNameTaken && <p className="text-xs text-destructive">{uiCopy.createInstance.nameTaken}</p>}
            {!checkingName && showInvalidFormat && <p className="text-xs text-destructive">Name must start with "WHISPER-"</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              {uiCopy.createInstance.descriptionLabel}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={uiCopy.createInstance.descriptionPlaceholder}
              disabled={isSubmitting}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isSubmitting}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            {uiCopy.createInstance.cancelButton}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || checkingName || !selectedState}
            className="flex-1 bg-secondary hover:bg-secondary/90 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uiCopy.createInstance.submitting}
              </>
            ) : (
              uiCopy.createInstance.submitButton
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
