import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useGetPlacesForCounty } from '@/hooks/useUSGeography';
import type { USPlace } from '@/backend';
import { IconBubble } from '@/components/common/IconBubble';

interface SelectPlaceProps {
  countyGeoId: string | null;
  value: USPlace | null;
  onChange: (place: USPlace | null) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function SelectPlace({ countyGeoId, value, onChange, onOpenChange, disabled = false }: SelectPlaceProps) {
  const { data: places = [], isLoading, error } = useGetPlacesForCounty(countyGeoId);

  const handleValueChange = (hierarchicalId: string) => {
    const selected = places.find((p) => p.hierarchicalId === hierarchicalId);
    onChange(selected || null);
  };

  if (!countyGeoId) {
    return (
      <Select disabled>
        <SelectTrigger className="bg-[oklch(0.15_0.05_230)] border-white/20 text-white/50 rounded-xl h-12 text-base">
          <SelectValue placeholder="Select a county first" />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <IconBubble size="sm" variant="warning" className="bg-destructive/20 text-destructive border-destructive/30">
          <AlertCircle className="h-3 w-3" />
        </IconBubble>
        <AlertDescription>Failed to load places. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Select
      value={value?.hierarchicalId || ''}
      onValueChange={handleValueChange}
      onOpenChange={onOpenChange}
      disabled={isLoading || disabled}
    >
      <SelectTrigger className="bg-[oklch(0.15_0.05_230)] border-white/20 text-white rounded-xl h-12 text-base focus:border-accent focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed">
        <SelectValue placeholder={isLoading ? 'Loading places...' : 'Select a city/town (optional)'} />
      </SelectTrigger>
      <SelectContent className="bg-[oklch(0.18_0.05_230)] border-white/20 text-white max-h-[300px]">
        {places.map((place) => (
          <SelectItem
            key={place.hierarchicalId}
            value={place.hierarchicalId}
            className="focus:bg-accent/20 focus:text-white"
          >
            {place.fullName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
