import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useGetCountiesForState } from '@/hooks/useUSGeography';
import type { USCounty } from '@/backend';
import { IconBubble } from '@/components/common/IconBubble';

interface SelectCountyProps {
  stateGeoId: string | null;
  value: USCounty | null;
  onChange: (county: USCounty | null) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function SelectCounty({ stateGeoId, value, onChange, onOpenChange, disabled = false }: SelectCountyProps) {
  const { data: counties = [], isLoading, error } = useGetCountiesForState(stateGeoId);

  const handleValueChange = (hierarchicalId: string) => {
    const selected = counties.find((c) => c.hierarchicalId === hierarchicalId);
    onChange(selected || null);
  };

  if (!stateGeoId) {
    return (
      <Select disabled>
        <SelectTrigger className="bg-[oklch(0.15_0.05_230)] border-white/20 text-white/50 rounded-xl h-12 text-base">
          <SelectValue placeholder="Select a state first" />
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
        <AlertDescription>Failed to load counties. Please try again.</AlertDescription>
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
        <SelectValue placeholder={isLoading ? 'Loading counties...' : 'Select a county (optional)'} />
      </SelectTrigger>
      <SelectContent className="bg-[oklch(0.18_0.05_230)] border-white/20 text-white max-h-[300px]">
        {counties.map((county) => (
          <SelectItem
            key={county.hierarchicalId}
            value={county.hierarchicalId}
            className="focus:bg-accent/20 focus:text-white"
          >
            {county.fullName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
