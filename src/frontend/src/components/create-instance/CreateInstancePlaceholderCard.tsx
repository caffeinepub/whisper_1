import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, CheckCircle2, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { useCheckInstanceName, useSubmitProposal } from '@/hooks/useCreateInstanceProposal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useGetAllStates, useGetCountiesForState, useGetPlacesForCounty } from '@/hooks/useUSGeography';
import type { GeoId, USState, USCounty, USPlace } from '@/backend';
import { USHierarchyLevel } from '@/backend';

interface CreateInstancePlaceholderCardProps {
  onClose: () => void;
}

type Scope = 'place' | 'county' | 'state';

export function CreateInstancePlaceholderCard({ onClose }: CreateInstancePlaceholderCardProps) {
  const [scope, setScope] = useState<Scope>('place');
  const [selectedState, setSelectedState] = useState<USState | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<USCounty | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<USPlace | null>(null);
  const [instanceName, setInstanceName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch geography data
  const { data: states = [], isLoading: isLoadingStates, error: statesError } = useGetAllStates();
  const { data: counties = [], isLoading: isLoadingCounties, error: countiesError } = useGetCountiesForState(
    selectedState?.hierarchicalId || null
  );
  const { data: places = [], isLoading: isLoadingPlaces, error: placesError } = useGetPlacesForCounty(
    selectedCounty?.hierarchicalId || null
  );

  // Auto-generate instance name based on selections
  useEffect(() => {
    let generatedName = '';

    if (scope === 'place' && selectedPlace) {
      // Format: WhisperDavenport-IA
      const statePart = selectedState?.shortName || '';
      generatedName = `Whisper${selectedPlace.shortName.replace(/\s+/g, '')}-${statePart}`;
    } else if (scope === 'county' && selectedCounty) {
      // Format: WhisperScottCounty-IA
      const statePart = selectedState?.shortName || '';
      const countyName = selectedCounty.shortName.replace(/\s+/g, '');
      generatedName = `Whisper${countyName}-${statePart}`;
    } else if (scope === 'state' && selectedState) {
      // Format: WhisperIowa
      generatedName = `Whisper${selectedState.longName.replace(/\s+/g, '')}`;
    }

    setInstanceName(generatedName);
  }, [scope, selectedState, selectedCounty, selectedPlace]);

  // Debounce the instance name to avoid excessive backend calls
  const debouncedInstanceName = useDebouncedValue(instanceName, 500);

  // Check if instance name is taken (only when we have a valid debounced name)
  const { 
    data: isNameTaken, 
    isLoading: isCheckingName,
    error: nameCheckError 
  } = useCheckInstanceName(debouncedInstanceName);

  // Submit proposal mutation
  const submitProposal = useSubmitProposal();

  // Clear submission error when selections change
  useEffect(() => {
    if (submitProposal.isError) {
      submitProposal.reset();
    }
  }, [selectedState, selectedCounty, selectedPlace, scope]);

  // Reset dependent selections when parent changes
  useEffect(() => {
    setSelectedCounty(null);
    setSelectedPlace(null);
  }, [selectedState]);

  useEffect(() => {
    setSelectedPlace(null);
  }, [selectedCounty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!instanceName.trim()) {
      return;
    }

    if (isNameTaken) {
      return;
    }

    // Validate required selections based on scope
    if (scope === 'place' && (!selectedState || !selectedCounty || !selectedPlace)) {
      return;
    }
    if (scope === 'county' && (!selectedState || !selectedCounty)) {
      return;
    }
    if (scope === 'state' && !selectedState) {
      return;
    }

    try {
      // Build description from form data
      let description = '';
      let geographyLevel: USHierarchyLevel;
      let censusBoundaryId = '';
      let squareMeters = BigInt(0);
      let population2020 = '';
      let stateName = '';
      let countyName = '';

      if (scope === 'place' && selectedPlace && selectedCounty && selectedState) {
        description = `Create city/town instance: ${selectedPlace.fullName}, ${selectedCounty.shortName}, ${selectedState.shortName}`;
        geographyLevel = USHierarchyLevel.place;
        censusBoundaryId = selectedPlace.censusCensusFipsCode;
        squareMeters = BigInt(selectedPlace.censusLandKm2) * BigInt(1000000); // Convert km² to m²
        population2020 = selectedPlace.population ? selectedPlace.population.toString() : 'N/A';
        stateName = selectedState.longName;
        countyName = selectedCounty.fullName;
      } else if (scope === 'county' && selectedCounty && selectedState) {
        description = `Create county instance: ${selectedCounty.fullName}, ${selectedState.shortName}`;
        geographyLevel = USHierarchyLevel.county;
        censusBoundaryId = selectedCounty.fipsCode;
        squareMeters = BigInt(selectedCounty.censusLandAreaSqMeters || '0');
        population2020 = selectedCounty.population2010 || 'N/A';
        stateName = selectedState.longName;
        countyName = selectedCounty.fullName;
      } else if (scope === 'state' && selectedState) {
        description = `Create state instance: ${selectedState.longName}`;
        geographyLevel = USHierarchyLevel.state;
        censusBoundaryId = selectedState.fipsCode;
        squareMeters = selectedState.censusLandAreaSqMeters;
        population2020 = 'N/A'; // State population not in current data model
        stateName = selectedState.longName;
        countyName = '';
      } else {
        return; // Should not reach here due to validation
      }

      await submitProposal.mutateAsync({
        description,
        instanceName: instanceName.trim(),
        status: 'Pending',
        state: stateName,
        county: countyName,
        geographyLevel,
        censusBoundaryId,
        squareMeters,
        population2020,
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
            <CardTitle className="text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Create New Instance
            </CardTitle>
            <CardDescription>
              Select a geographic location to propose a new Whisper installation
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
            <Label htmlFor="scope">Geographic Scope</Label>
            <Select value={scope} onValueChange={(value) => setScope(value as Scope)}>
              <SelectTrigger id="scope">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="place">City/Town</SelectItem>
                <SelectItem value="county">County</SelectItem>
                <SelectItem value="state">State</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose the level of government for this Whisper instance
            </p>
          </div>

          {/* State Selection */}
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            {statesError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load states. Please refresh the page and try again.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Select
                  value={selectedState?.hierarchicalId || ''}
                  onValueChange={(value) => {
                    const state = states.find((s) => s.hierarchicalId === value);
                    setSelectedState(state || null);
                  }}
                  disabled={isLoadingStates || states.length === 0}
                >
                  <SelectTrigger id="state">
                    <SelectValue 
                      placeholder={
                        isLoadingStates 
                          ? 'Loading states...' 
                          : states.length === 0 
                            ? 'No states available' 
                            : 'Select a state'
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.hierarchicalId} value={state.hierarchicalId}>
                        {state.longName} ({state.shortName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isLoadingStates && states.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No states found. Geography data may need to be loaded by an administrator.
                  </p>
                )}
              </>
            )}
          </div>

          {/* County Selection (for place and county scopes) */}
          {(scope === 'place' || scope === 'county') && (
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              {countiesError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load counties for the selected state. Please try selecting a different state.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Select
                    value={selectedCounty?.hierarchicalId || ''}
                    onValueChange={(value) => {
                      const county = counties.find((c) => c.hierarchicalId === value);
                      setSelectedCounty(county || null);
                    }}
                    disabled={!selectedState || isLoadingCounties}
                  >
                    <SelectTrigger id="county">
                      <SelectValue
                        placeholder={
                          !selectedState
                            ? 'Select a state first'
                            : isLoadingCounties
                              ? 'Loading counties...'
                              : counties.length === 0
                                ? 'No counties available'
                                : 'Select a county'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem key={county.hierarchicalId} value={county.hierarchicalId}>
                          {county.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedState && !isLoadingCounties && counties.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No counties found for the selected state.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Place Selection (for place scope only) */}
          {scope === 'place' && (
            <div className="space-y-2">
              <Label htmlFor="place">City/Town</Label>
              {placesError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load places for the selected county. Please try selecting a different county.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Select
                    value={selectedPlace?.hierarchicalId || ''}
                    onValueChange={(value) => {
                      const place = places.find((p) => p.hierarchicalId === value);
                      setSelectedPlace(place || null);
                    }}
                    disabled={!selectedCounty || isLoadingPlaces}
                  >
                    <SelectTrigger id="place">
                      <SelectValue
                        placeholder={
                          !selectedCounty
                            ? 'Select a county first'
                            : isLoadingPlaces
                              ? 'Loading cities and towns...'
                              : places.length === 0
                                ? 'No places available'
                                : 'Select a city or town'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {places.map((place) => (
                        <SelectItem key={place.hierarchicalId} value={place.hierarchicalId}>
                          {place.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCounty && !isLoadingPlaces && places.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No cities or towns found for the selected county.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Generated Instance Name Preview */}
          {instanceName && (
            <div className="space-y-2">
              <Label>Generated Instance Name</Label>
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted border border-border">
                <span className="font-mono text-sm flex-1">{instanceName}</span>
                {isCheckingName && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!isCheckingName && nameCheckError && (
                  <AlertCircle className="h-4 w-4 text-warning" />
                )}
                {!isCheckingName && !nameCheckError && isNameTaken && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                {!isCheckingName && !nameCheckError && !isNameTaken && debouncedInstanceName && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </div>
              {isCheckingName && (
                <p className="text-sm text-muted-foreground">Checking availability...</p>
              )}
              {!isCheckingName && nameCheckError && (
                <p className="text-sm text-warning">
                  Unable to verify name availability. Please try again.
                </p>
              )}
              {!isCheckingName && !nameCheckError && isNameTaken && (
                <p className="text-sm text-destructive">
                  This instance name is already taken. Please select a different location.
                </p>
              )}
              {!isCheckingName && !nameCheckError && !isNameTaken && debouncedInstanceName && (
                <p className="text-sm text-success">Name is available</p>
              )}
              <p className="text-sm text-muted-foreground">
                This name is automatically generated from your geographic selection
              </p>
            </div>
          )}

          {/* Submission Error */}
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

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !instanceName ||
                isCheckingName ||
                isNameTaken ||
                !!nameCheckError ||
                submitProposal.isPending ||
                (scope === 'place' && (!selectedState || !selectedCounty || !selectedPlace)) ||
                (scope === 'county' && (!selectedState || !selectedCounty)) ||
                (scope === 'state' && !selectedState)
              }
            >
              {submitProposal.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
