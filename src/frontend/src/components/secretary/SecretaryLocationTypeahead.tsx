import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';

interface TypeaheadOption {
  id: string;
  label: string;
  data: any;
}

interface SecretaryLocationTypeaheadProps {
  options: TypeaheadOption[];
  onSelect: (option: TypeaheadOption) => void;
  placeholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function SecretaryLocationTypeahead({
  options,
  onSelect,
  placeholder = 'Type to search...',
  emptyMessage = 'No results found',
  isLoading = false,
}: SecretaryLocationTypeaheadProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset selected index when filtered options change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm, options.length]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[selectedIndex]) {
          onSelect(filteredOptions[selectedIndex]);
          setSearchTerm('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSearchTerm('');
        break;
    }
  };

  const handleOptionClick = (option: TypeaheadOption) => {
    onSelect(option);
    setSearchTerm('');
  };

  // Show dropdown immediately if we have options, even with empty search
  const showDropdown = options.length > 0;

  return (
    <div className="space-y-2">
      <Input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-white text-black border-secondary/30 focus:border-secondary focus:ring-secondary"
      />

      {showDropdown && (
        <div className="bg-white rounded-lg border border-secondary/30 shadow-lg max-h-[240px] overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : filteredOptions.length > 0 ? (
            <ScrollArea className="h-full max-h-[240px]">
              <div className="p-1">
                {filteredOptions.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${
                      index === selectedIndex
                        ? 'bg-secondary/10 text-secondary font-medium'
                        : 'text-black hover:bg-secondary/5'
                    }`}
                  >
                    <span>{option.label}</span>
                    {index === selectedIndex && <Check className="h-4 w-4 text-secondary" />}
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">{emptyMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}
