import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useGetCountiesForState } from '@/hooks/useUSGeography';
import type { USCounty, GeoId } from '@/backend';
import { IconBubble } from '@/components/common/IconBubble';

interface SelectCountyProps {
  value: USCounty | null;
  onChange: (county: USCounty | null) => void;
  stateGeoId: GeoId | null;
  disabled?: boolean;
}

/**
 * Reusable controlled Select component for choosing a U.S. county.
 * Fetches counties via useGetCountiesForState and renders loading/empty/error states.
 */
export function SelectCounty({ value, onChange, stateGeoId, disabled = false }: SelectCountyProps) {
  const { data: counties = [], isLoading, error } = useGetCountiesForState(stateGeoId);

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <IconBubble size="sm" variant="warning" className="bg-destructive/20 text-destructive border-destructive/30">
          <AlertCircle className="h-3 w-3" />
        </IconBubble>
        <AlertDescription>
          Failed to load counties. Please try selecting a different state.
        </AlertDescription>
      </Alert>
    );
  }

  const isDisabled = disabled || !stateGeoId || isLoading || counties.length === 0;

  return (
    <Select
      value={value?.hierarchicalId || ''}
      onValueChange={(hierarchicalId) => {
        if (!hierarchicalId) {
          onChange(null);
          return;
        }
        const county = counties.find((c) => c.hierarchicalId === hierarchicalId);
        onChange(county || null);
      }}
      disabled={isDisabled}
    >
      <SelectTrigger className="rounded-xl">
        <SelectValue
          placeholder={
            !stateGeoId
              ? 'Select a state first'
              : isLoading
                ? 'Loading counties…'
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
  );
}
