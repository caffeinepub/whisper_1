import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Loader2, ChevronLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useSecretaryChat } from '@/hooks/useSecretaryChat';
import { SecretaryLocationTypeahead } from './SecretaryLocationTypeahead';
import { FlowEngineBrain } from '@/secretary/brain/FlowEngineBrain';
import { useActor } from '@/hooks/useActor';
import type { SecretaryBrain } from '@/secretary/brain/SecretaryBrain';
import type { USState, USCounty, USPlace } from '@/backend';
import { showEarnedPointsToast } from '@/lib/earnedPointsToast';

interface NavigationRequest {
  destinationId: string;
  shouldClose: boolean;
}

interface SecretaryWidgetProps {
  open?: boolean;
  onClose: () => void;
  navigationHandler?: (request: NavigationRequest) => void;
  findByKeyword?: (keyword: string) => string | null;
}

export function SecretaryWidget({ onClose, navigationHandler, findByKeyword }: SecretaryWidgetProps) {
  const { messages, addUserMessage, addAssistantMessage, returnToMenu, resetChat } = useSecretaryChat();
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [brain, setBrain] = useState<SecretaryBrain | null>(null);

  useEffect(() => {
    if (actor) {
      const brainInstance = new FlowEngineBrain(actor);
      setBrain(brainInstance);
    }
  }, [actor]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || !brain) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addUserMessage(userMessage);
    setIsProcessing(true);

    try {
      await brain.handleUserText(userMessage);
      const viewModel = brain.getViewModel();

      // Add all assistant messages from the view model
      if (viewModel.assistantMessages && viewModel.assistantMessages.length > 0) {
        viewModel.assistantMessages.forEach(msg => addAssistantMessage(msg));
      }
    } catch (error) {
      console.error('Secretary processing error:', error);
      addAssistantMessage('I encountered an error processing your request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTypeaheadSelect = async (item: USState | USCounty | USPlace) => {
    if (!brain) return;

    setIsProcessing(true);
    try {
      // Use the correct action type for location selection
      await brain.handleAction({ type: 'location-selected', payload: item });
      const viewModel = brain.getViewModel();

      // Add all assistant messages from the view model
      if (viewModel.assistantMessages && viewModel.assistantMessages.length > 0) {
        viewModel.assistantMessages.forEach(msg => addAssistantMessage(msg));
      }
    } catch (error) {
      console.error('Secretary typeahead error:', error);
      addAssistantMessage('I encountered an error processing your selection. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnToMenu = async () => {
    if (!brain) return;

    setIsProcessing(true);
    try {
      brain.reset();
      const viewModel = brain.getViewModel();

      // Add all assistant messages from the view model
      if (viewModel.assistantMessages && viewModel.assistantMessages.length > 0) {
        viewModel.assistantMessages.forEach(msg => addAssistantMessage(msg));
      }
      returnToMenu();
    } catch (error) {
      console.error('Secretary return to menu error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const viewModel = brain?.getViewModel();
  const showTypeahead = viewModel?.showTypeahead && viewModel.typeaheadOptions && viewModel.typeaheadOptions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      <div className="w-full max-w-md h-[600px] bg-card border border-border rounded-lg shadow-2xl flex flex-col pointer-events-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            {messages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReturnToMenu}
                disabled={isProcessing}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-lg font-semibold">Secretary</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {showTypeahead && viewModel?.typeaheadOptions && (
          <div className="px-4 pb-2">
            <SecretaryLocationTypeahead
              options={viewModel.typeaheadOptions}
              onSelect={(option) => {
                const item = option.data as USState | USCounty | USPlace;
                handleTypeaheadSelect(item);
              }}
              isLoading={false}
              placeholder={viewModel.typeaheadPlaceholder || "Search locations..."}
            />
          </div>
        )}

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
