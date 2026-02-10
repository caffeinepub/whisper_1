import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

/**
 * Reusable controlled Select component for choosing a U.S. state.
 * Fetches states via useGetAllStates and renders loading/empty/error states.
 */
export function SelectState({ value, onChange, disabled = false }: SelectStateProps) {
  const { data: states = [], isLoading, error } = useGetAllStates();

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <IconBubble size="sm" variant="warning" className="bg-destructive/20 text-destructive border-destructive/30">
          <AlertCircle className="h-3 w-3" />
        </IconBubble>
        <AlertDescription>
          Failed to load states. Please refresh the page and try again.
        </AlertDescription>
      </Alert>
    );
  }

  const isDisabled = disabled || isLoading || states.length === 0;

  return (
    <Select
      value={value?.hierarchicalId || ''}
      onValueChange={(hierarchicalId) => {
        if (!hierarchicalId) {
          onChange(null);
          return;
        }
        const state = states.find((s) => s.hierarchicalId === hierarchicalId);
        onChange(state || null);
      }}
      disabled={isDisabled}
    >
      <SelectTrigger className="rounded-xl">
        <SelectValue
          placeholder={
            isLoading
              ? 'Loading states…'
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
  );
}
