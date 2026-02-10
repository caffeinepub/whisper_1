import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, X, Send, RotateCcw } from 'lucide-react';
import { useSecretaryChat } from '@/hooks/useSecretaryChat';

interface SecretaryWidgetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOptionSelect?: (optionNumber: number) => void;
}

export function SecretaryWidget({ open, onOpenChange, onOptionSelect }: SecretaryWidgetProps) {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const [userInput, setUserInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    showMenu,
    initializeChat,
    handleOptionClick,
    handleFreeTextSubmit,
    returnToMenu,
    resetChat,
  } = useSecretaryChat();

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, initializeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  const handleOptionClickInternal = (optionNumber: number) => {
    const result = handleOptionClick(optionNumber);
    onOptionSelect?.(result);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    const result = handleFreeTextSubmit(userInput);
    if (result !== null) {
      onOptionSelect?.(result);
    }
    setUserInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-glow bg-accent hover:bg-accent-hover text-white hover-lift border border-accent/20"
        size="icon"
        aria-label="Open Secretary assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-glow-lg border-accent/50 rounded-xl bg-black/40 backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-white/10">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
          <MessageCircle className="h-5 w-5 text-accent" />
          Secretary
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetChat}
            className="h-8 w-8 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
            aria-label="Reset chat"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="h-8 w-8 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-accent text-white border border-accent/30 shadow-sm'
                      : 'bg-slate-700/90 text-white border border-slate-600/50 shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {showMenu && (
              <div className="space-y-2 pt-2">
                <Separator className="my-2 bg-white/10" />
                <p className="text-xs text-white/60 font-semibold uppercase tracking-wide">Quick Actions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { num: 1, label: 'Report Issue' },
                    { num: 2, label: 'Track Status' },
                    { num: 3, label: 'Community Forum' },
                    { num: 4, label: 'Resources' },
                    { num: 5, label: 'Browse Issues' },
                    { num: 6, label: 'Contact Support' },
                  ].map((option) => (
                    <Button
                      key={option.num}
                      variant="outline"
                      size="sm"
                      onClick={() => handleOptionClickInternal(option.num)}
                      className="justify-start text-xs h-auto py-2.5 rounded-lg border-white/20 bg-white/5 text-white hover:bg-accent hover:text-white hover:border-accent/50 transition-all font-medium"
                    >
                      <span className="font-bold mr-1.5">{option.num}.</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {!showMenu && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={returnToMenu}
                  className="w-full rounded-lg border-white/20 bg-white/5 text-white hover:bg-accent hover:text-white font-medium"
                >
                  Return to Menu
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message or option number..."
              className="flex-1 rounded-xl border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-accent focus:ring-accent/50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!userInput.trim()}
              size="icon"
              className="rounded-xl bg-accent hover:bg-accent-hover text-white border border-accent/20 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
