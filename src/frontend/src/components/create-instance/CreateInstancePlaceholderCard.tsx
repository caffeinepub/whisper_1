import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { X, CheckCircle2, AlertCircle, Loader2, MapPin, MessageCircle } from 'lucide-react';
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

  const { data: states = [], isLoading: isLoadingStates, error: statesError } = useGetAllStates();
  const { data: counties = [], isLoading: isLoadingCounties, error: countiesError } = useGetCountiesForState(
    selectedState?.hierarchicalId || null
  );
  const { data: places = [], isLoading: isLoadingPlaces, error: placesError } = useGetPlacesForCounty(
    selectedCounty?.hierarchicalId || null
  );

  // Auto-generate instance name and description
  useEffect(() => {
    let generatedName = '';

    if (scope === 'place' && selectedPlace) {
      const statePart = selectedState?.shortName || '';
      generatedName = `Whisper${selectedPlace.shortName.replace(/\s+/g, '')}-${statePart}`;
    } else if (scope === 'county' && selectedCounty) {
      const statePart = selectedState?.shortName || '';
      const countyName = selectedCounty.shortName.replace(/\s+/g, '');
      generatedName = `Whisper${countyName}-${statePart}`;
    } else if (scope === 'state' && selectedState) {
      generatedName = `Whisper${selectedState.longName.replace(/\s+/g, '')}`;
    }

    setInstanceName(generatedName);
  }, [scope, selectedState, selectedCounty, selectedPlace]);

  const debouncedInstanceName = useDebouncedValue(instanceName, 500);

  const { 
    data: isNameTaken, 
    isLoading: isCheckingName,
    error: nameCheckError 
  } = useCheckInstanceName(debouncedInstanceName);

  const submitProposal = useSubmitProposal();

  useEffect(() => {
    if (submitProposal.isError) {
      submitProposal.reset();
    }
  }, [selectedState, selectedCounty, selectedPlace, scope]);

  useEffect(() => {
    setSelectedCounty(null);
    setSelectedPlace(null);
  }, [selectedState]);

  useEffect(() => {
    setSelectedPlace(null);
  }, [selectedCounty]);

  // Generate preview description
  const getPreviewDescription = () => {
    if (scope === 'place' && selectedPlace && selectedCounty && selectedState) {
      return `Create city/town instance: ${selectedPlace.fullName}, ${selectedCounty.shortName}, ${selectedState.shortName}`;
    } else if (scope === 'county' && selectedCounty && selectedState) {
      return `Create county instance: ${selectedCounty.fullName}, ${selectedState.shortName}`;
    } else if (scope === 'state' && selectedState) {
      return `Create state instance: ${selectedState.longName}`;
    }
    return 'Select a location to see the description...';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!instanceName.trim() || isNameTaken) return;

    if (scope === 'place' && (!selectedState || !selectedCounty || !selectedPlace)) return;
    if (scope === 'county' && (!selectedState || !selectedCounty)) return;
    if (scope === 'state' && !selectedState) return;

    try {
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
        squareMeters = BigInt(selectedPlace.censusLandKm2) * BigInt(1000000);
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
        population2020 = 'N/A';
        stateName = selectedState.longName;
        countyName = '';
      } else {
        return;
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
      console.error('Error submitting proposal:', error);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    submitProposal.reset();
    onClose();
  };

  if (showSuccess) {
    return (
      <Card className="border-success shadow-glow bg-card rounded-xl">
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
              className="h-8 w-8 rounded-lg"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-success/50 bg-success/5 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription>
              Your proposal for <span className="font-medium">{instanceName}</span> has been submitted.
              The community will review your proposal in the next development phase.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={handleClose} className="rounded-xl">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-accent/50 shadow-glow rounded-xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2 text-accent">
              <MapPin className="h-5 w-5" />
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
            className="h-8 w-8 rounded-lg"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Form Column */}
          <form onSubmit={handleSubmit} className="space-y-6 md:col-span-2">
            <div className="space-y-2">
              <Label htmlFor="scope">Geographic Scope</Label>
              <Select value={scope} onValueChange={(value) => setScope(value as Scope)}>
                <SelectTrigger id="scope" className="rounded-xl">
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

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              {statesError ? (
                <Alert variant="destructive" className="rounded-xl">
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
                    <SelectTrigger id="state" className="rounded-xl">
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

            {(scope === 'place' || scope === 'county') && (
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                {countiesError ? (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load counties for the selected state.
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
                      <SelectTrigger id="county" className="rounded-xl">
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

            {scope === 'place' && (
              <div className="space-y-2">
                <Label htmlFor="place">City/Town</Label>
                {placesError ? (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load places for the selected county.
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
                      <SelectTrigger id="place" className="rounded-xl">
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

            {instanceName && (
              <div className="space-y-2">
                <Label>Instance Name</Label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border">
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
                    This instance name is already taken.
                  </p>
                )}
                {!isCheckingName && !nameCheckError && !isNameTaken && debouncedInstanceName && (
                  <p className="text-sm text-success">Name is available</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Purpose / Description</Label>
              <Textarea
                value={getPreviewDescription()}
                readOnly
                className="rounded-xl bg-muted/50 resize-none"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Auto-generated from your selection
              </p>
            </div>

            {submitProposal.isError && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {submitProposal.error instanceof Error
                    ? submitProposal.error.message
                    : 'Failed to submit proposal. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={
                !instanceName ||
                isCheckingName ||
                isNameTaken ||
                submitProposal.isPending ||
                (scope === 'place' && (!selectedState || !selectedCounty || !selectedPlace)) ||
                (scope === 'county' && (!selectedState || !selectedCounty)) ||
                (scope === 'state' && !selectedState)
              }
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-medium"
            >
              {submitProposal.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Instance'
              )}
            </Button>
          </form>

          {/* Secretary Panel */}
          <div className="hidden md:block">
            <div className="sticky top-4 p-6 rounded-xl bg-accent/10 border border-accent/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-accent">AI Secretary</p>
                  <p className="text-xs text-muted-foreground">Here to help</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-card/50 border border-border/50">
                  <p className="text-sm text-foreground">
                    "How can I assist with civic issues today?"
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-card/50 border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    I can help you understand the instance creation process and answer questions about Whisper.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
