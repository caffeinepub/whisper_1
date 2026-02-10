import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send, Menu, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { IconBubble } from '@/components/common/IconBubble';
import { useSecretaryChat } from '@/hooks/useSecretaryChat';
import { SECRETARY_OPTIONS, matchKeywordToOption } from '@/lib/secretaryNavigation';

interface SecretaryWidgetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOptionSelect?: (optionNumber: number) => void;
}

export function SecretaryWidget({ open, onOpenChange, onOptionSelect }: SecretaryWidgetProps) {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isMenuVisible, addUserMessage, addAssistantMessage, returnToMenu, resetChat } = useSecretaryChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);

    addUserMessage(userMessage);

    setTimeout(() => {
      const matchedOption = matchKeywordToOption(userMessage);

      if (matchedOption) {
        addAssistantMessage(
          `Great! ${matchedOption.confirmationMessage || `Let me help you with that.`}`
        );

        setTimeout(() => {
          onOptionSelect?.(matchedOption.number);
          setIsProcessing(false);
        }, 500);
      } else {
        addAssistantMessage(
          "I'm not sure I understand. Could you try rephrasing, or select an option from the menu?"
        );
        setIsProcessing(false);
      }
    }, 800);
  };

  const handleOptionClick = (optionNumber: number) => {
    const option = SECRETARY_OPTIONS.find((opt) => opt.number === optionNumber);
    if (!option) return;

    addUserMessage(option.label);
    addAssistantMessage(option.confirmationMessage || `Let me help you with that.`);

    setTimeout(() => {
      onOptionSelect?.(optionNumber);
    }, 500);
  };

  const handleClose = () => {
    onOpenChange?.(false);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="bg-[oklch(0.15_0.05_230)]/95 backdrop-blur-md border-secondary/50 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[oklch(0.12_0.05_230)] border-b border-secondary/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBubble size="md" variant="secondary">
              <MessageCircle className="h-5 w-5" />
            </IconBubble>
            <div>
              <h3 className="font-semibold text-white">Secretary</h3>
              <p className="text-xs text-white/60">Your AI assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isMenuVisible && (
              <Button
                variant="ghost"
                size="icon"
                onClick={returnToMenu}
                className="h-8 w-8 text-secondary hover:text-secondary hover:bg-secondary/20 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="h-96">
          {isMenuVisible ? (
            <ScrollArea className="h-full p-4">
              <div className="space-y-3">
                <p className="text-white/80 text-sm mb-4">How can I help you today?</p>
                {SECRETARY_OPTIONS.map((option) => (
                  <button
                    key={option.number}
                    onClick={() => handleOptionClick(option.number)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-secondary/20 border border-white/10 hover:border-secondary/50 transition-all text-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                  >
                    <span className="font-medium text-secondary">{option.number}.</span> {option.label}
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-secondary text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input */}
        {!isMenuVisible && (
          <div className="border-t border-secondary/30 p-4 bg-[oklch(0.12_0.05_230)]">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                disabled={isProcessing}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isProcessing}
                size="icon"
                className="bg-secondary hover:bg-secondary/90 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
