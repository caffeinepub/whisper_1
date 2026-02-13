/**
 * Secretary-specific hierarchical location selector component that composes existing geography selection UI.
 * Uses the existing LocationSelector to provide state → county → place selection with proper disabled prerequisites,
 * and includes a primary "Continue" action enabled once a valid locationId can be derived.
 */

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LocationSelector } from '@/components/location/LocationSelector';
import { useLocationSelection } from '@/hooks/useLocationSelection';
import type { USState, USCounty, USPlace } from '@/backend';

interface SecretaryHierarchicalLocationSelectorProps {
  initialState?: USState | null;
  initialCounty?: USCounty | null;
  initialPlace?: USPlace | null;
  onContinue: (state: USState | null, county: USCounty | null, place: USPlace | null) => void;
  disabled?: boolean;
}

/**
 * Secretary-specific hierarchical selector component
 */
export function SecretaryHierarchicalLocationSelector({
  initialState = null,
  initialCounty = null,
  initialPlace = null,
  onContinue,
  disabled = false,
}: SecretaryHierarchicalLocationSelectorProps) {
  const {
    selection,
    setSelectedState,
    setSelectedCounty,
    setSelectedPlace,
    locationId,
  } = useLocationSelection();

  // Initialize with provided values
  useEffect(() => {
    if (initialState && !selection.state) {
      setSelectedState(initialState);
    }
    if (initialCounty && !selection.county) {
      setSelectedCounty(initialCounty);
    }
    if (initialPlace && !selection.place) {
      setSelectedPlace(initialPlace);
    }
  }, [initialState, initialCounty, initialPlace, selection, setSelectedState, setSelectedCounty, setSelectedPlace]);

  const canContinue = !!locationId;

  const handleContinueClick = () => {
    if (canContinue) {
      onContinue(selection.state, selection.county, selection.place);
    }
  };

  return (
    <div className="space-y-4">
      <LocationSelector
        selectedState={selection.state}
        selectedCounty={selection.county}
        selectedPlace={selection.place}
        onStateChange={setSelectedState}
        onCountyChange={setSelectedCounty}
        onPlaceChange={setSelectedPlace}
        disabled={disabled}
      />
      
      <Button
        onClick={handleContinueClick}
        disabled={!canContinue || disabled}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
}
