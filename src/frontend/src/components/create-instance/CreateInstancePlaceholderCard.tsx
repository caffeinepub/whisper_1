import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { X, MapPin, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { SelectState } from './SelectState';
import { SelectCounty } from './SelectCounty';
import { SelectPlace } from './SelectPlace';
import { useGetAllStates } from '@/hooks/useUSGeography';
import { useCheckInstanceName, useSubmitProposal } from '@/hooks/useCreateInstanceProposal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { IconBubble } from '@/components/common/IconBubble';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { USHierarchyLevel, type USState, type USCounty, type USPlace } from '@/backend';

interface CreateInstancePlaceholderCardProps {
  onClose: () => void;
  initialInstanceName?: string;
  onProposalSubmitted?: (instanceName: string) => void;
}

export function CreateInstancePlaceholderCard({ onClose, initialInstanceName = '', onProposalSubmitted }: CreateInstancePlaceholderCardProps) {
  const [instanceName, setInstanceName] = useState(initialInstanceName);
  const [description, setDescription] = useState('');
  const [selectedState, setSelectedState] = useState<USState | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<USCounty | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<USPlace | null>(null);
  const [geographyLevel, setGeographyLevel] = useState<'state' | 'county' | 'place'>('state');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedInstanceName, setSubmittedInstanceName] = useState('');
  const [geographyError, setGeographyError] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const debouncedInstanceName = useDebouncedValue(instanceName, 500);

  const { data: states = [], isLoading: statesLoading, error: statesError } = useGetAllStates();

  const {
    data: isNameTaken,
    isLoading: isCheckingName,
    error: nameCheckError,
  } = useCheckInstanceName(debouncedInstanceName);

  const { mutate: submitProposal, isPending: isSubmitting, error: submitError } = useSubmitProposal();

  useEffect(() => {
    if (selectedState) {
      setSelectedCounty(null);
      setSelectedPlace(null);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedCounty) {
      setSelectedPlace(null);
    }
  }, [selectedCounty]);

  // Clear geography error when selections change
  useEffect(() => {
    setGeographyError(null);
    setAttemptedSubmit(false);
  }, [selectedState, selectedCounty, selectedPlace]);

  const isNameAvailable = debouncedInstanceName.length > 0 && !isNameTaken && !isCheckingName && !nameCheckError;
  const showNameTaken = debouncedInstanceName.length > 0 && isNameTaken && !isCheckingName;
  const showNameCheckError = debouncedInstanceName.length > 0 && nameCheckError && !isCheckingName;

  // Geography validation: State always required; County required for county/place levels; Place required for place level
  const isGeographyValid = 
    selectedState !== null &&
    (geographyLevel === 'state' || 
     (geographyLevel === 'county' && selectedCounty !== null) ||
     (geographyLevel === 'place' && selectedCounty !== null && selectedPlace !== null));

  const canSubmit =
    instanceName.trim().length > 0 &&
    description.trim().length > 0 &&
    isGeographyValid &&
    isNameAvailable &&
    !isSubmitting;

  // Compute missing geography selections
  const getMissingGeographyMessage = (): string | null => {
    if (!selectedState) {
      return 'Please select a state.';
    }
    if (geographyLevel === 'county' && !selectedCounty) {
      return 'Please select a county.';
    }
    if (geographyLevel === 'place') {
      if (!selectedCounty) {
        return 'Please select a county.';
      }
      if (!selectedPlace) {
        return 'Please select a place.';
      }
    }
    return null;
  };

  // Determine which field is missing for highlighting
  const getMissingField = (): 'state' | 'county' | 'place' | null => {
    if (!selectedState) return 'state';
    if (geographyLevel === 'county' && !selectedCounty) return 'county';
    if (geographyLevel === 'place') {
      if (!selectedCounty) return 'county';
      if (!selectedPlace) return 'place';
    }
    return null;
  };

  const handleSubmitAttempt = () => {
    setAttemptedSubmit(true);
    // Check if geography is valid
    const missingMessage = getMissingGeographyMessage();
    if (missingMessage) {
      setGeographyError(missingMessage);
      return;
    }

    // Proceed with submission
    handleSubmit();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    let censusBoundaryId = '';
    let squareMeters = BigInt(0);
    let population2020 = 'N/A';
    let countyName = 'N/A';
    let hierarchyLevel: USHierarchyLevel = USHierarchyLevel.state;

    if (geographyLevel === 'state' && selectedState) {
      censusBoundaryId = selectedState.fipsCode;
      squareMeters = selectedState.censusLandAreaSqMeters;
      population2020 = 'N/A';
      hierarchyLevel = USHierarchyLevel.state;
    } else if (geographyLevel === 'county' && selectedCounty) {
      censusBoundaryId = selectedCounty.fipsCode;
      squareMeters = BigInt(selectedCounty.censusLandAreaSqMeters);
      population2020 = selectedCounty.population2010;
      countyName = selectedCounty.shortName;
      hierarchyLevel = USHierarchyLevel.county;
    } else if (geographyLevel === 'place' && selectedPlace) {
      censusBoundaryId = selectedPlace.censusCensusFipsCode;
      squareMeters = BigInt(selectedPlace.censusLandKm2) * BigInt(1_000_000);
      population2020 = selectedPlace.population ? selectedPlace.population.toString() : 'N/A';
      countyName = selectedPlace.countyFullName;
      hierarchyLevel = USHierarchyLevel.place;
    }

    submitProposal(
      {
        description,
        instanceName,
        status: 'Pending',
        state: selectedState?.shortName || 'N/A',
        county: countyName,
        geographyLevel: hierarchyLevel,
        censusBoundaryId,
        squareMeters,
        population2020,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setSubmittedInstanceName(instanceName);
        },
      }
    );
  };

  const handleViewProposal = () => {
    if (onProposalSubmitted) {
      onProposalSubmitted(submittedInstanceName);
    }
    onClose();
  };

  const missingField = attemptedSubmit ? getMissingField() : null;

  if (showSuccess) {
    return (
      <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBubble size="lg" variant="success">
                <CheckCircle2 className="h-6 w-6" />
              </IconBubble>
              <CardTitle className="text-2xl text-white">Proposal Submitted Successfully!</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <CardDescription className="text-white/70">
            Your instance proposal has been submitted and is pending review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-success/20 border-success/50">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-white">
              Your proposal for <strong>{submittedInstanceName}</strong> has been created. It will be reviewed by administrators before approval.
            </AlertDescription>
          </Alert>
          <div className="flex gap-3">
            <Button
              onClick={handleViewProposal}
              className="bg-secondary hover:bg-secondary/90 text-white font-semibold flex-1"
            >
              View Your Proposal
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-secondary text-secondary hover:bg-secondary/20 hover:text-secondary focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBubble size="lg" variant="secondary">
              <MapPin className="h-6 w-6" />
            </IconBubble>
            <CardTitle className="text-2xl text-white">Create Instance Proposal</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <CardDescription className="text-white/70">
          Submit a proposal to create a new Whisper instance for your community.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instance Name */}
        <div className="space-y-2">
          <Label htmlFor="instance-name" className="text-white">
            Instance Name
          </Label>
          <Input
            id="instance-name"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            placeholder="e.g., San Francisco Civic Hub"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-secondary"
            disabled={isSubmitting}
          />
          {isCheckingName && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <LoadingIndicator size="sm" />
              <span>Checking availability...</span>
            </div>
          )}
          {isNameAvailable && (
            <div className="flex items-center gap-2 text-success text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Name is available</span>
            </div>
          )}
          {showNameTaken && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>This name is already taken</span>
            </div>
          )}
          {showNameCheckError && (
            <div className="flex items-center gap-2 text-warning text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Unable to verify name availability. Please try again.</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-white">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose and goals of this instance..."
            rows={4}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-secondary"
            disabled={isSubmitting}
          />
        </div>

        <Separator className="bg-white/10" />

        {/* Geography Selection */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold">Select Geography</h4>

          {/* State Selection */}
          <div className={`space-y-2 ${missingField === 'state' ? 'p-3 rounded-lg bg-destructive/10 border-2 border-destructive/50 ring-2 ring-destructive/30' : ''}`}>
            <Label htmlFor="state" className="text-white">
              State <span className="text-destructive">*</span>
            </Label>
            {statesLoading ? (
              <LoadingIndicator label="Loading states..." />
            ) : statesError ? (
              <Alert className="bg-destructive/20 border-destructive/50">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-white">
                  Failed to load states. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <SelectState
                value={selectedState}
                onChange={(state) => {
                  setSelectedState(state);
                  setGeographyLevel('state');
                }}
                disabled={isSubmitting}
              />
            )}
          </div>

          {/* County Selection */}
          {selectedState && (
            <div className={`space-y-2 ${missingField === 'county' ? 'p-3 rounded-lg bg-destructive/10 border-2 border-destructive/50 ring-2 ring-destructive/30' : ''}`}>
              <Label htmlFor="county" className="text-white">
                County {(geographyLevel === 'county' || geographyLevel === 'place') && <span className="text-destructive">*</span>}
              </Label>
              <SelectCounty
                stateGeoId={selectedState.hierarchicalId}
                value={selectedCounty}
                onChange={(county) => {
                  setSelectedCounty(county);
                  setGeographyLevel('county');
                }}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Place Selection */}
          {selectedCounty && (
            <div className={`space-y-2 ${missingField === 'place' ? 'p-3 rounded-lg bg-destructive/10 border-2 border-destructive/50 ring-2 ring-destructive/30' : ''}`}>
              <Label htmlFor="place" className="text-white">
                Place {geographyLevel === 'place' && <span className="text-destructive">*</span>}
              </Label>
              <SelectPlace
                countyGeoId={selectedCounty.hierarchicalId}
                value={selectedPlace}
                onChange={(place) => {
                  setSelectedPlace(place);
                  setGeographyLevel('place');
                }}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Geography Error Message */}
          {geographyError && (
            <Alert className="bg-destructive/20 border-destructive/50">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-white">{geographyError}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Submit Error */}
        {submitError && (
          <Alert className="bg-destructive/20 border-destructive/50">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-white">{submitError.message}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmitAttempt}
          disabled={!canSubmit}
          className="w-full bg-accent hover:bg-accent-hover text-white font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting Proposal...
            </>
          ) : (
            'Submit Proposal'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
