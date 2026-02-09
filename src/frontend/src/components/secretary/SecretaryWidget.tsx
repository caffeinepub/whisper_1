import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, X, Send, RotateCcw, Menu } from 'lucide-react';
import { useSecretaryChat } from '@/hooks/useSecretaryChat';

interface SecretaryWidgetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOptionSelect?: (optionNumber: number) => void;
}

export function SecretaryWidget({ open, onOpenChange, onOptionSelect }: SecretaryWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isFirstOpen,
    showMenu,
    initializeChat,
    handleOptionClick,
    handleFreeTextSubmit,
    addAssistantMessage,
    returnToMenu,
    resetChat,
  } = useSecretaryChat();

  // Use controlled open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  // Initialize chat when opened for the first time
  useEffect(() => {
    if (isOpen && isFirstOpen) {
      initializeChat();
    }
  }, [isOpen, isFirstOpen, initializeChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOptionButtonClick = (optionNumber: number) => {
    handleOptionClick(optionNumber);
    
    // Add confirmation message as assistant
    setTimeout(() => {
      if (optionNumber === 5) {
        addAssistantMessage('Got it — opening Proposals now.');
        setTimeout(() => {
          onOptionSelect?.(optionNumber);
        }, 500);
      } else {
        addAssistantMessage('This feature isn\'t available yet in the prototype, but it will be coming soon.');
      }
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const optionNumber = handleFreeTextSubmit(inputValue);
      setInputValue('');
      
      // If a number was detected, handle it like an option click
      if (optionNumber !== null) {
        setTimeout(() => {
          if (optionNumber === 5) {
            addAssistantMessage('Got it — opening Proposals now.');
            setTimeout(() => {
              onOptionSelect?.(optionNumber);
            }, 500);
          } else {
            addAssistantMessage('This feature isn\'t available yet in the prototype, but it will be coming soon.');
          }
        }, 300);
      }
    }
  };

  const handleReset = () => {
    resetChat();
  };

  const handleReturnToMenu = () => {
    returnToMenu();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        aria-label="Open Secretary chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] shadow-lg border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Whisper Secretary</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="h-8 w-8"
            aria-label="Start over - reset chat"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
            aria-label="Close Secretary chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Option buttons - show when menu is visible */}
            {showMenu && (
              <div className="space-y-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => handleOptionButtonClick(1)}
                >
                  <span className="text-xs">
                    1. Report a problem or issue (pothole, unsafe building, code violation, etc.)
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => handleOptionButtonClick(2)}
                >
                  <span className="text-xs">
                    2. File a formal complaint (police conduct, official misconduct, FOIA denial, etc.)
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => handleOptionButtonClick(3)}
                >
                  <span className="text-xs">
                    3. Request information or submit a FOIA request
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => handleOptionButtonClick(4)}
                >
                  <span className="text-xs">
                    4. Start or join a campaign / petition
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => handleOptionButtonClick(5)}
                >
                  <span className="text-xs">
                    5. Browse local issues or see what's happening in my area
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => handleOptionButtonClick(6)}
                >
                  <span className="text-xs">
                    6. Something else (suggestion, question, general inquiry)
                  </span>
                </Button>
              </div>
            )}

            {/* In-chat action buttons */}
            {!showMenu && messages.length > 1 && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReturnToMenu}
                  className="flex-1"
                >
                  <Menu className="h-3 w-3 mr-1" />
                  Return to menu
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
        <Separator />
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message or option number..."
              className="flex-1"
              aria-label="Chat message input"
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
