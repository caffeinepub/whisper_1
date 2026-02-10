import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useSecretaryChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setIsMenuVisible(false);
  };

  const addAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: 'assistant', content }]);
    setIsMenuVisible(false);
  };

  const returnToMenu = () => {
    setMessages([]);
    setIsMenuVisible(true);
  };

  const resetChat = () => {
    setMessages([]);
    setIsMenuVisible(true);
  };

  return {
    messages,
    isMenuVisible,
    addUserMessage,
    addAssistantMessage,
    returnToMenu,
    resetChat,
  };
}
