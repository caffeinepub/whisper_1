import React, { useEffect, useRef, useState } from 'react';
import { X, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FlowEngineBrain } from '@/secretary/brain/FlowEngineBrain';
import { useActor } from '@/hooks/useActor';
import { useGetAllStates, useGetCountiesForState, useGetPlacesForState } from '@/hooks/useUSGeography';
import { useComplaintSuggestions } from '@/hooks/useComplaintSuggestions';
import { USHierarchyLevel } from '@/backend';
import { SecretaryLocationTypeahead } from './SecretaryLocationTypeahead';
import type { NavigationHandler } from '@/secretary/brain/SecretaryBrain';
import type { USState, USCounty, USPlace } from '@/backend';

interface SecretaryWidgetProps {
  open: boolean;
  onClose: () => void;
  navigationHandler?: NavigationHandler;
  findByKeyword?: (text: string) => { id: string } | null;
}

export function SecretaryWidget({
  open,
  onClose,
  navigationHandler,
  findByKeyword,
}: SecretaryWidgetProps) {
  const { actor } = useActor();
  const [brain] = useState(() => new FlowEngineBrain(actor));
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Geography queries for typeahead/discovery
  const { data: allStates = [], isLoading: statesLoading } = useGetAllStates();
  
  // Get current slots to determine which geography queries to enable
  const context = brain.getContext();
  const stateSlot = context.slots.state as USState | null;
  
  const { data: countiesForState = [], isLoading: countiesLoading } = useGetCountiesForState(
    stateSlot?.hierarchicalId || null
  );
  
  const { data: placesForState = [], isLoading: placesLoading } = useGetPlacesForState(
    stateSlot?.hierarchicalId || null
  );

  // Complaint suggestions
  const locationLevel = context.slots.place
    ? USHierarchyLevel.place
    : context.slots.county
    ? USHierarchyLevel.county
    : context.slots.state
    ? USHierarchyLevel.state
    : USHierarchyLevel.country;

  const { data: complaintSuggestions = [] } = useComplaintSuggestions(locationLevel, '');

  // Update brain with actor and geography data
  useEffect(() => {
    brain.setActor(actor);
  }, [actor, brain]);

  useEffect(() => {
    if (navigationHandler) {
      brain.setNavigationHandler(navigationHandler);
    }
  }, [navigationHandler, brain]);

  useEffect(() => {
    if (findByKeyword) {
      brain.setKeywordFinder(findByKeyword);
    }
  }, [findByKeyword, brain]);

  // Update geography data for typeahead
  useEffect(() => {
    brain.setGeographyData(allStates, countiesForState, placesForState);
  }, [allStates, countiesForState, placesForState, brain]);

  useEffect(() => {
    brain.setComplaintSuggestions(complaintSuggestions);
  }, [complaintSuggestions, brain]);

  // Get messages and view model
  const messages = brain.getMessages();
  const viewModel = brain.getViewModel();
  const typeaheadOptions = brain.getTypeaheadOptions();
  const suggestions = brain.getSuggestions();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const text = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);

    try {
      await brain.handleUserText(text);
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleButtonClick = async (action: any) => {
    setIsProcessing(true);
    try {
      await brain.handleAction(action);
    } catch (error) {
      console.error('Error handling button action:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTypeaheadSelect = async (option: { id: string; label: string; data: any }) => {
    setIsProcessing(true);
    try {
      const data = option.data;
      // Determine if it's a state, county, or place
      if (data.longName && data.shortName && data.fipsCode) {
        // It's a state
        await brain.handleAction({ type: 'state-selected', payload: data });
      } else {
        // It's a county or place
        await brain.handleAction({ type: 'location-selected', payload: data });
      }
    } catch (error) {
      console.error('Error selecting typeahead option:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: string) => {
    setIsProcessing(true);
    try {
      await brain.handleAction({ type: 'suggestion-selected', payload: suggestion });
    } catch (error) {
      console.error('Error selecting suggestion:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToMenu = async () => {
    setIsProcessing(true);
    try {
      await brain.handleAction({ type: 'back-to-menu', payload: null });
    } catch (error) {
      console.error('Error going back to menu:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open) return null;

  const showBackButton = !brain.isShowingMenu();

  // Determine if typeahead is loading
  const isTypeaheadLoading = statesLoading || countiesLoading || placesLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      <div className="w-full max-w-md h-[600px] bg-background border border-border rounded-lg shadow-lg flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToMenu}
                disabled={isProcessing}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-lg font-semibold">Secretary</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Action buttons */}
            {viewModel.buttons && viewModel.buttons.length > 0 && (
              <div className="space-y-2">
                {viewModel.buttons.map((button, idx) => (
                  <Button
                    key={idx}
                    variant={button.variant || 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleButtonClick(button.action)}
                    disabled={isProcessing}
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Typeahead */}
            {viewModel.showTypeahead && (
              <SecretaryLocationTypeahead
                options={typeaheadOptions}
                onSelect={handleTypeaheadSelect}
                placeholder={viewModel.typeaheadPlaceholder || 'Search...'}
                isLoading={isTypeaheadLoading}
              />
            )}

            {/* Suggestions */}
            {viewModel.showSuggestions && suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Select a category:</p>
                {suggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    disabled={isProcessing}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        {viewModel.showTextInput && (
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={viewModel.textInputPlaceholder || 'Type a message...'}
                disabled={isProcessing}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isProcessing}
                size="icon"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
