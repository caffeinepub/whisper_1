import { Label } from '@/components/ui/label';
import { SelectState } from '@/components/create-instance/SelectState';
import { SelectCounty } from '@/components/create-instance/SelectCounty';
import { SelectPlace } from '@/components/create-instance/SelectPlace';
import type { USState, USCounty, USPlace } from '@/backend';

interface LocationSelectorProps {
  selectedState: USState | null;
  selectedCounty: USCounty | null;
  selectedPlace: USPlace | null;
  onStateChange: (state: USState | null) => void;
  onCountyChange: (county: USCounty | null) => void;
  onPlaceChange: (place: USPlace | null) => void;
  disabled?: boolean;
}

/**
 * Composed location selector UI that reuses existing geography dropdown components
 * to support state→county→place selection with dependency clearing.
 */
export function LocationSelector({
  selectedState,
  selectedCounty,
  selectedPlace,
  onStateChange,
  onCountyChange,
  onPlaceChange,
  disabled = false,
}: LocationSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="state-select" className="text-sm font-medium">
          State
        </Label>
        <SelectState
          value={selectedState}
          onChange={onStateChange}
          disabled={disabled}
        />
      </div>

      {selectedState && (
        <div className="space-y-2">
          <Label htmlFor="county-select" className="text-sm font-medium">
            County (optional)
          </Label>
          <SelectCounty
            stateGeoId={selectedState.hierarchicalId}
            value={selectedCounty}
            onChange={onCountyChange}
            disabled={disabled}
          />
        </div>
      )}

      {selectedCounty && (
        <div className="space-y-2">
          <Label htmlFor="place-select" className="text-sm font-medium">
            City/Place (optional)
          </Label>
          <SelectPlace
            countyGeoId={selectedCounty.hierarchicalId}
            value={selectedPlace}
            onChange={onPlaceChange}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
