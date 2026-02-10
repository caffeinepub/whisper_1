import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useGetAllStates } from '@/hooks/useUSGeography';
import type { USState } from '@/backend';
import { IconBubble } from '@/components/common/IconBubble';

interface SelectStateProps {
  value: USState | null;
  onChange: (state: USState | null) => void;
  disabled?: boolean;
}

export function SelectState({ value, onChange, disabled = false }: SelectStateProps) {
  const { data: states = [], isLoading, error } = useGetAllStates();

  const handleValueChange = (hierarchicalId: string) => {
    const selected = states.find((s) => s.hierarchicalId === hierarchicalId);
    onChange(selected || null);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <IconBubble size="sm" variant="warning" className="bg-destructive/20 text-destructive border-destructive/30">
          <AlertCircle className="h-3 w-3" />
        </IconBubble>
        <AlertDescription>Failed to load states. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Select
      value={value?.hierarchicalId || ''}
      onValueChange={handleValueChange}
      disabled={isLoading || disabled}
    >
      <SelectTrigger className="bg-[oklch(0.15_0.05_230)] border-white/20 text-white rounded-xl h-12 text-base focus:border-accent focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed">
        <SelectValue placeholder={isLoading ? 'Loading states...' : 'Select a state'} />
      </SelectTrigger>
      <SelectContent className="bg-[oklch(0.18_0.05_230)] border-white/20 text-white">
        {states.map((state) => (
          <SelectItem
            key={state.hierarchicalId}
            value={state.hierarchicalId}
            className="focus:bg-accent/20 focus:text-white"
          >
            {state.longName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
