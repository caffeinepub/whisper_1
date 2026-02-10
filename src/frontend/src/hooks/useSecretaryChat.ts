import { useState, useCallback } from 'react';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function useSecretaryChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Secretary assistant. I can help you navigate Whisper and get things done.',
    },
  ]);
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setIsMenuVisible(false);
  }, []);

  const addAssistantMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: 'assistant', content }]);
  }, []);

  const returnToMenu = useCallback(() => {
    setIsMenuVisible(true);
    addAssistantMessage('What else can I help you with?');
  }, [addAssistantMessage]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your Secretary assistant. I can help you navigate Whisper and get things done.',
      },
    ]);
    setIsMenuVisible(true);
  }, []);

  return {
    messages,
    isMenuVisible,
    addUserMessage,
    addAssistantMessage,
    returnToMenu,
    resetChat,
  };
}
