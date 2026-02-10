import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, AlertCircle, CheckCircle2, MapPin, Ruler } from 'lucide-react';
import { SelectState } from './SelectState';
import { SelectCounty } from './SelectCounty';
import { SelectPlace } from './SelectPlace';
import { useCheckInstanceName, useSubmitProposal } from '@/hooks/useCreateInstanceProposal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useGetAllStates } from '@/hooks/useUSGeography';
import { USHierarchyLevel, type USState, type USCounty, type USPlace } from '@/backend';
import { IconBubble } from '@/components/common/IconBubble';

interface CreateInstancePlaceholderCardProps {
  onClose?: () => void;
  initialInstanceName?: string;
}

export function CreateInstancePlaceholderCard({ onClose, initialInstanceName = '' }: CreateInstancePlaceholderCardProps) {
  const [instanceName, setInstanceName] = useState(initialInstanceName);
  const [description, setDescription] = useState('');
  const [selectedState, setSelectedState] = useState<USState | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<USCounty | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<USPlace | null>(null);
  const [geographyLevel, setGeographyLevel] = useState<'state' | 'county' | 'place'>('state');

  const debouncedInstanceName = useDebouncedValue(instanceName, 500);

  const { data: states = [] } = useGetAllStates();

  const {
    data: isTaken,
    isLoading: isCheckingAvailability,
    error: availabilityError,
  } = useCheckInstanceName(debouncedInstanceName);

  const isAvailable = isTaken === false;

  const submitProposal = useSubmitProposal();

  useEffect(() => {
    if (selectedState && !selectedCounty && !selectedPlace) {
      setGeographyLevel('state');
    } else if (selectedCounty && !selectedPlace) {
      setGeographyLevel('county');
    } else if (selectedPlace) {
      setGeographyLevel('place');
    }
  }, [selectedState, selectedCounty, selectedPlace]);

  useEffect(() => {
    if (selectedState && !instanceName) {
      setInstanceName(`Whisper ${selectedState.shortName}`);
    }
  }, [selectedState, instanceName]);

  useEffect(() => {
    if (selectedCounty) {
      setInstanceName(`Whisper ${selectedCounty.shortName}`);
    }
  }, [selectedCounty]);

  useEffect(() => {
    if (selectedPlace) {
      setInstanceName(`Whisper ${selectedPlace.shortName}`);
    }
  }, [selectedPlace]);

  const handleSubmit = async () => {
    if (!instanceName.trim() || !selectedState) return;

    let censusBoundaryId = '';
    let squareMeters = BigInt(0);
    let population2020 = 'N/A';
    let state = '';
    let county = '';

    state = selectedState.shortName;

    if (geographyLevel === 'state') {
      censusBoundaryId = selectedState.hierarchicalId;
      squareMeters = selectedState.censusLandAreaSqMeters;
      population2020 = 'N/A';
    } else if (geographyLevel === 'county' && selectedCounty) {
      county = selectedCounty.shortName;
      censusBoundaryId = selectedCounty.hierarchicalId;
      squareMeters = BigInt(selectedCounty.censusLandAreaSqMeters);
      population2020 = selectedCounty.population2010;
    } else if (geographyLevel === 'place' && selectedPlace) {
      if (!selectedCounty) return;
      county = selectedCounty.shortName;
      censusBoundaryId = selectedPlace.hierarchicalId;
      // Convert censusLandKm2 (bigint) to square meters
      squareMeters = selectedPlace.censusLandKm2 * BigInt(1_000_000);
      population2020 = selectedPlace.population ? selectedPlace.population.toString() : 'N/A';
    }

    const hierarchyLevel: USHierarchyLevel =
      geographyLevel === 'state'
        ? USHierarchyLevel.state
        : geographyLevel === 'county'
          ? USHierarchyLevel.county
          : USHierarchyLevel.place;

    await submitProposal.mutateAsync({
      description: description.trim() || `Instance for ${instanceName}`,
      instanceName: instanceName.trim(),
      status: 'Pending',
      state,
      county,
      geographyLevel: hierarchyLevel,
      censusBoundaryId,
      squareMeters,
      population2020,
    });
  };

  const canSubmit =
    instanceName.trim() &&
    selectedState &&
    isAvailable === true &&
    !isCheckingAvailability &&
    !submitProposal.isPending;

  return (
    <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 shadow-[0_0_30px_rgba(20,184,166,0.3)] rounded-2xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-3xl font-bold text-white">Create Instance</CardTitle>
          <CardDescription className="text-lg text-white/80">
            Configure your new Whisper installation
          </CardDescription>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
            aria-label="Close"
          >
            <IconBubble size="sm" variant="muted" className="bg-white/10 text-white border-white/20">
              <X className="h-4 w-4" />
            </IconBubble>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="state" className="text-white/90 font-semibold">
                State *
              </Label>
              <SelectState value={selectedState} onChange={setSelectedState} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="county" className="text-white/90 font-semibold">
                County (Optional)
              </Label>
              <SelectCounty
                stateGeoId={selectedState?.hierarchicalId || null}
                value={selectedCounty}
                onChange={setSelectedCounty}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="place" className="text-white/90 font-semibold">
                City/Town (Optional)
              </Label>
              <SelectPlace
                countyGeoId={selectedCounty?.hierarchicalId || null}
                value={selectedPlace}
                onChange={setSelectedPlace}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              <Label htmlFor="instance-name" className="text-white/90 font-semibold">
                Instance Name *
              </Label>
              <Input
                id="instance-name"
                placeholder="e.g., Whisper California"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                className="bg-[oklch(0.15_0.05_230)] border-white/20 text-white placeholder:text-white/40 rounded-xl h-12 text-base focus:border-accent focus:ring-accent"
              />
              {debouncedInstanceName && isCheckingAvailability && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking availability...</span>
                </div>
              )}
              {debouncedInstanceName && !isCheckingAvailability && isAvailable === true && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <IconBubble size="sm" variant="success">
                    <CheckCircle2 className="h-3 w-3" />
                  </IconBubble>
                  <span>Name is available</span>
                </div>
              )}
              {debouncedInstanceName && !isCheckingAvailability && isAvailable === false && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <IconBubble size="sm" variant="warning" className="bg-destructive/20 text-destructive border-destructive/30">
                    <AlertCircle className="h-3 w-3" />
                  </IconBubble>
                  <span>Name is already taken</span>
                </div>
              )}
              {availabilityError && (
                <Alert variant="destructive" className="mt-2">
                  <IconBubble size="sm" variant="warning" className="bg-destructive/20 text-destructive border-destructive/30">
                    <AlertCircle className="h-3 w-3" />
                  </IconBubble>
                  <AlertDescription>
                    {availabilityError instanceof Error
                      ? availabilityError.message
                      : 'Failed to check name availability'}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-white/90 font-semibold">
                Description (Optional)
              </Label>
              <Input
                id="description"
                placeholder="Brief description of this instance..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[oklch(0.15_0.05_230)] border-white/20 text-white placeholder:text-white/40 rounded-xl h-12 text-base focus:border-accent focus:ring-accent"
              />
            </div>

            {submitProposal.isError && (
              <Alert variant="destructive">
                <IconBubble size="sm" variant="warning" className="bg-destructive/20 text-destructive border-destructive/30">
                  <AlertCircle className="h-3 w-3" />
                </IconBubble>
                <AlertDescription>
                  {submitProposal.error instanceof Error
                    ? submitProposal.error.message
                    : 'Failed to submit proposal. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            {submitProposal.isSuccess && (
              <Alert className="border-success/50 bg-success/5">
                <IconBubble size="sm" variant="success">
                  <CheckCircle2 className="h-3 w-3" />
                </IconBubble>
                <AlertDescription>Proposal submitted successfully!</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold rounded-xl h-12 text-base shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitProposal.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Proposal'
              )}
            </Button>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="bg-[oklch(0.15_0.05_230)]/50 border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <IconBubble size="md" variant="accent">
                  <MapPin className="h-5 w-5" />
                </IconBubble>
                <h3 className="text-xl font-bold text-white">Preview</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/60 mb-1">Instance Name</p>
                  <p className="text-lg font-semibold text-white">
                    {instanceName || <span className="text-white/40">Not set</span>}
                  </p>
                </div>

                <Separator className="bg-white/10" />

                <div>
                  <p className="text-sm text-white/60 mb-1">Geography Level</p>
                  <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                    {geographyLevel.charAt(0).toUpperCase() + geographyLevel.slice(1)}
                  </Badge>
                </div>

                {selectedState && (
                  <>
                    <Separator className="bg-white/10" />
                    <div>
                      <p className="text-sm text-white/60 mb-1">State</p>
                      <p className="text-base font-medium text-white">{selectedState.longName}</p>
                    </div>
                  </>
                )}

                {selectedCounty && (
                  <>
                    <Separator className="bg-white/10" />
                    <div>
                      <p className="text-sm text-white/60 mb-1">County</p>
                      <p className="text-base font-medium text-white">{selectedCounty.fullName}</p>
                    </div>
                  </>
                )}

                {selectedPlace && (
                  <>
                    <Separator className="bg-white/10" />
                    <div>
                      <p className="text-sm text-white/60 mb-1">City/Town</p>
                      <p className="text-base font-medium text-white">{selectedPlace.fullName}</p>
                    </div>
                  </>
                )}

                {geographyLevel === 'state' && selectedState && (
                  <>
                    <Separator className="bg-white/10" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <IconBubble size="sm" variant="success">
                          <Ruler className="h-3 w-3" />
                        </IconBubble>
                        <p className="text-sm text-white/60">Land Area</p>
                      </div>
                      <p className="text-base font-medium text-white">
                        {(Number(selectedState.censusLandAreaSqMeters) / 1_000_000).toFixed(2)} km²
                      </p>
                    </div>
                  </>
                )}

                {geographyLevel === 'county' && selectedCounty && (
                  <>
                    <Separator className="bg-white/10" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <IconBubble size="sm" variant="success">
                          <Ruler className="h-3 w-3" />
                        </IconBubble>
                        <p className="text-sm text-white/60">Land Area</p>
                      </div>
                      <p className="text-base font-medium text-white">
                        {(Number(selectedCounty.censusLandAreaSqMeters) / 1_000_000).toFixed(2)} km²
                      </p>
                    </div>
                  </>
                )}

                {geographyLevel === 'place' && selectedPlace && (
                  <>
                    <Separator className="bg-white/10" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <IconBubble size="sm" variant="success">
                          <Ruler className="h-3 w-3" />
                        </IconBubble>
                        <p className="text-sm text-white/60">Land Area</p>
                      </div>
                      <p className="text-base font-medium text-white">
                        {Number(selectedPlace.censusLandKm2).toFixed(2)} km²
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
