import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useGetPlacesForCounty } from '@/hooks/useUSGeography';
import type { USPlace, GeoId } from '@/backend';
import { IconBubble } from '@/components/common/IconBubble';

interface SelectPlaceProps {
  value: USPlace | null;
  onChange: (place: USPlace | null) => void;
  countyGeoId: GeoId | null;
  disabled?: boolean;
}

/**
 * Reusable controlled Select component for choosing a U.S. place (city/town).
 * Fetches places via useGetPlacesForCounty and renders loading/empty/error/disabled states.
 */
export function SelectPlace({ value, onChange, countyGeoId, disabled = false }: SelectPlaceProps) {
  const { data: places = [], isLoading, error } = useGetPlacesForCounty(countyGeoId);

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <IconBubble size="sm" variant="warning" className="bg-destructive/20 text-destructive border-destructive/30">
          <AlertCircle className="h-3 w-3" />
        </IconBubble>
        <AlertDescription>
          Failed to load places for the selected county.
        </AlertDescription>
      </Alert>
    );
  }

  const isDisabled = disabled || !countyGeoId || isLoading || places.length === 0;

  return (
    <Select
      value={value?.hierarchicalId || ''}
      onValueChange={(hierarchicalId) => {
        if (!hierarchicalId) {
          onChange(null);
          return;
        }
        const place = places.find((p) => p.hierarchicalId === hierarchicalId);
        onChange(place || null);
      }}
      disabled={isDisabled}
    >
      <SelectTrigger className="rounded-xl">
        <SelectValue
          placeholder={
            !countyGeoId
              ? 'Select a county first'
              : isLoading
                ? 'Loading cities and towns…'
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
  );
}
