/**
 * Dedicated issueCategory dropdown component for the Secretary guided report flow.
 * Uses the shadcn-ui Select component to provide an accessible select control and option rendering.
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface SecretaryIssueCategorySelectProps {
  options: string[];
  onSelect: (category: string) => void;
  placeholder?: string;
  label?: string;
}

export function SecretaryIssueCategorySelect({
  options,
  onSelect,
  placeholder = 'Select a category',
  label = 'Issue Category',
}: SecretaryIssueCategorySelectProps) {
  const handleValueChange = (value: string) => {
    onSelect(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="issue-category-select" className="text-sm font-medium">
        {label}
      </Label>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger id="issue-category-select" className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No categories available
            </div>
          ) : (
            options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
