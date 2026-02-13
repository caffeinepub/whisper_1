/**
 * Secretary chat widget with initial greeting message, geography data wiring, speech-to-text microphone button,
 * enhanced styling with visible card background and borders, improved typeahead/suggestion selection that fills slots and advances flow directly,
 * confirmation summary display for guided report-issue flow including issue title, textarea support for multi-line issue description input,
 * issueCategory dropdown for the guided report category step, and hierarchical location selector for guided report location step.
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SecretaryBrain } from '../../secretary/brain/SecretaryBrain';
import type { NodeViewModel } from '../../secretary/flow/types';
import { SecretaryLocationTypeahead } from './SecretaryLocationTypeahead';
import { SecretaryIssueCategorySelect } from './SecretaryIssueCategorySelect';
import { SecretaryHierarchicalLocationSelector } from './SecretaryHierarchicalLocationSelector';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { FlowEngineBrain } from '@/secretary/brain/FlowEngineBrain';
import type { USState, USCounty, USPlace } from '@/backend';

interface SecretaryWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  brain: SecretaryBrain;
  onNavigate?: (destination: { destinationId: string; shouldClose: boolean }) => void;
  findByKeyword?: (text: string) => { id: string } | null;
}

export function SecretaryWidget({
  isOpen,
  onClose,
  brain,
  onNavigate,
  findByKeyword,
}: SecretaryWidgetProps) {
  const [inputValue, setInputValue] = useState('');
  const [viewModel, setViewModel] = useState<NodeViewModel | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech-to-text
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error: speechError,
  } = useSpeechToText();

  // Update input with transcript
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Set navigation handler and keyword finder on FlowEngineBrain
  useEffect(() => {
    if (brain instanceof FlowEngineBrain) {
      if (onNavigate) {
        brain.setNavigationHandler(onNavigate);
      }
      if (findByKeyword) {
        brain.setKeywordFinder(findByKeyword);
      }
    }
  }, [brain, onNavigate, findByKeyword]);

  // Update view model when brain changes
  useEffect(() => {
    if (isOpen) {
      const vm = brain.getViewModel();
      setViewModel(vm);
    }
  }, [isOpen, brain]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [viewModel?.assistantMessages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      if (viewModel?.showTextarea && textareaRef.current) {
        textareaRef.current.focus();
      } else if (viewModel?.showTextInput && inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen, viewModel?.showTextInput, viewModel?.showTextarea]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const text = inputValue.trim();
    setInputValue('');

    await brain.handleUserText(text);
    const vm = brain.getViewModel();
    setViewModel(vm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleButtonClick = async (action: any) => {
    await brain.handleAction(action);
    const vm = brain.getViewModel();
    setViewModel(vm);
  };

  const handleTypeaheadSelect = async (selection: { id: string; label: string; data: any }) => {
    // Use the brain's geography selection handler if available
    if (brain instanceof FlowEngineBrain) {
      await brain.handleGeographySelection(selection);
      const vm = brain.getViewModel();
      setViewModel(vm);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Use the brain's category suggestion handler if available
    if (brain instanceof FlowEngineBrain) {
      await brain.handleCategorySuggestionSelection(suggestion);
      const vm = brain.getViewModel();
      setViewModel(vm);
    }
  };

  const handleCategoryDropdownSelect = async (category: string) => {
    // Use the brain's category suggestion handler for dropdown selection
    if (brain instanceof FlowEngineBrain) {
      await brain.handleCategorySuggestionSelection(category);
      const vm = brain.getViewModel();
      setViewModel(vm);
    }
  };

  const handleHierarchicalLocationContinue = async (
    state: USState | null,
    county: USCounty | null,
    place: USPlace | null
  ) => {
    // Use the brain's hierarchical location selection handler
    if (brain instanceof FlowEngineBrain) {
      await brain.handleHierarchicalLocationSelection(state, county, place);
      const vm = brain.getViewModel();
      setViewModel(vm);
    }
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isOpen) return null;

  const messages = brain.getMessages();
  
  // Get initial location values for hierarchical selector
  const context = brain instanceof FlowEngineBrain ? brain.getContext() : null;
  const initialState = context?.guidedReportDraft.location.state || null;
  const initialCounty = context?.guidedReportDraft.location.county || null;
  const initialPlace = context?.guidedReportDraft.location.place || null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-2 border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
          <CardTitle className="text-lg font-semibold">Secretary</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4" ref={scrollRef}>
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
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {viewModel?.showConfirmationSummary && viewModel.confirmationSummary && (
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Review your issue report:</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Title:</span> {viewModel.confirmationSummary.title}</p>
                    <p><span className="font-medium">Location:</span> {viewModel.confirmationSummary.location}</p>
                    <p><span className="font-medium">Category:</span> {viewModel.confirmationSummary.category}</p>
                    <p><span className="font-medium">Details:</span> {viewModel.confirmationSummary.details}</p>
                  </div>
                </div>
              )}

              {viewModel?.buttons && viewModel.buttons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {viewModel.buttons.map((btn, idx) => (
                    <Button
                      key={idx}
                      variant={btn.variant || 'outline'}
                      size="sm"
                      onClick={() => handleButtonClick(btn.action)}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>
              )}

              {viewModel?.showSuggestions && viewModel.suggestions && viewModel.suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Suggested categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {viewModel.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t space-y-2">
            {viewModel?.showTypeahead && viewModel.typeaheadOptions && viewModel.typeaheadOptions.length > 0 && (
              <SecretaryLocationTypeahead
                options={viewModel.typeaheadOptions}
                onSelect={handleTypeaheadSelect}
                placeholder={viewModel.typeaheadPlaceholder || 'Type to search...'}
              />
            )}

            {viewModel?.showHierarchicalLocationSelector && (
              <SecretaryHierarchicalLocationSelector
                initialState={initialState}
                initialCounty={initialCounty}
                initialPlace={initialPlace}
                onContinue={handleHierarchicalLocationContinue}
              />
            )}

            {viewModel?.showCategoryDropdown && (
              <SecretaryIssueCategorySelect
                options={viewModel.categoryDropdownOptions || []}
                onSelect={handleCategoryDropdownSelect}
                placeholder={viewModel.categoryDropdownPlaceholder}
                label={viewModel.categoryDropdownLabel}
              />
            )}

            {viewModel?.showTextarea && (
              <div className="space-y-2">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={viewModel.textareaPlaceholder || 'Type your message...'}
                  className="min-h-[100px] resize-none"
                  rows={4}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant={isListening ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={toggleMicrophone}
                    disabled={!!speechError}
                    title={speechError || (isListening ? 'Stop recording' : 'Start recording')}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button onClick={handleSend} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {viewModel?.showTextInput && !viewModel?.showTextarea && !viewModel?.showHierarchicalLocationSelector && (
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={viewModel.textInputPlaceholder || 'Type your message...'}
                  className="flex-1"
                />
                <Button
                  variant={isListening ? 'destructive' : 'outline'}
                  size="icon"
                  onClick={toggleMicrophone}
                  disabled={!!speechError}
                  title={speechError || (isListening ? 'Stop recording' : 'Start recording')}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button onClick={handleSend} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
