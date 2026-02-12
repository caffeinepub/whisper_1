import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { LocationSelector } from './LocationSelector';
import { useBrowserGeolocation } from '@/hooks/useBrowserGeolocation';
import { uiCopy } from '@/lib/uiCopy';
import type { USState, USCounty, USPlace } from '@/backend';

interface LocationAcquisitionCardProps {
  selectedState: USState | null;
  selectedCounty: USCounty | null;
  selectedPlace: USPlace | null;
  onStateChange: (state: USState | null) => void;
  onCountyChange: (county: USCounty | null) => void;
  onPlaceChange: (place: USPlace | null) => void;
  onLocationConfirmed?: () => void;
}

/**
 * UI card that offers "Use my current location" (invokes Geolocation) and a manual
 * selection fallback. On geolocation denial/unavailability, shows clear English
 * guidance and keeps manual selection fully functional.
 */
export function LocationAcquisitionCard({
  selectedState,
  selectedCounty,
  selectedPlace,
  onStateChange,
  onCountyChange,
  onPlaceChange,
  onLocationConfirmed,
}: LocationAcquisitionCardProps) {
  const { status, error, requestLocation } = useBrowserGeolocation();
  const [showManualSelection, setShowManualSelection] = useState(false);

  const handleUseCurrentLocation = () => {
    requestLocation();
    // Note: We don't have reverse geocoding, so we'll show a message
    // and fall back to manual selection
  };

  const handleManualSelection = () => {
    setShowManualSelection(true);
  };

  const isLoading = status === 'loading';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-secondary" />
          {uiCopy.location.selectTitle}
        </CardTitle>
        <CardDescription>
          {uiCopy.location.selectDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Geolocation attempt feedback */}
        {status === 'error' && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === 'success' && (
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              {uiCopy.location.geolocationSuccess}
            </AlertDescription>
          </Alert>
        )}

        {/* Location acquisition buttons */}
        {!showManualSelection && (
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleUseCurrentLocation}
              disabled={isLoading}
              className="w-full"
              variant="default"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uiCopy.location.detectingLocation}
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  {uiCopy.location.useCurrentLocation}
                </>
              )}
            </Button>

            <Button
              onClick={handleManualSelection}
              variant="outline"
              className="w-full"
            >
              {uiCopy.location.selectManually}
            </Button>
          </div>
        )}

        {/* Manual location selector - always available after geolocation error or manual choice */}
        {(showManualSelection || status === 'error' || status === 'success') && (
          <div className="space-y-4">
            {!showManualSelection && (
              <div className="text-sm text-muted-foreground">
                {uiCopy.location.manualSelectionPrompt}
              </div>
            )}
            
            <LocationSelector
              selectedState={selectedState}
              selectedCounty={selectedCounty}
              selectedPlace={selectedPlace}
              onStateChange={onStateChange}
              onCountyChange={onCountyChange}
              onPlaceChange={onPlaceChange}
            />

            {selectedState && onLocationConfirmed && (
              <Button
                onClick={onLocationConfirmed}
                className="w-full"
                variant="default"
              >
                {uiCopy.location.confirmLocation}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
