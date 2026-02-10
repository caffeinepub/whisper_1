import { useState, useCallback } from 'react';
import { matchKeywordToOption } from '@/lib/secretaryNavigation';

export type MessageRole = 'assistant' | 'user';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface SecretaryChatState {
  messages: ChatMessage[];
  isFirstOpen: boolean;
  showMenu: boolean;
}

const WELCOME_MESSAGE = `Hello! 👋 Welcome to Whisper — your platform for making your voice heard and getting real solutions to community issues.

I'm your assistant, here to help you navigate this prototype. I can guide you to different parts of the platform, though some features are still in development and will show placeholders.

**What I can do:**
• Help you navigate within the prototype
• Direct you to available sections

**What I can't do yet:**
• Some flows are placeholders and not fully available
• This is a prototype assistant, not a full AI system

What brings you here today? You can click an option below or describe what you're looking for in plain words:

1. Report a problem or issue (pothole, unsafe building, code violation, etc.)
2. File a formal complaint (police conduct, official misconduct, FOIA denial, etc.)
3. Request information or submit a FOIA request
4. Start or join a campaign / petition
5. Browse local issues or see what's happening in my area
6. Something else (suggestion, question, general inquiry)`;

const MENU_MESSAGE = `What would you like to do? Choose an option below or describe what you're looking for:

1. Report a problem or issue (pothole, unsafe building, code violation, etc.)
2. File a formal complaint (police conduct, official misconduct, FOIA denial, etc.)
3. Request information or submit a FOIA request
4. Start or join a campaign / petition
5. Browse local issues or see what's happening in my area
6. Something else (suggestion, question, general inquiry)`;

export function useSecretaryChat() {
  const [state, setState] = useState<SecretaryChatState>({
    messages: [],
    isFirstOpen: true,
    showMenu: false,
  });

  const initializeChat = useCallback(() => {
    if (state.isFirstOpen) {
      setState({
        messages: [
          {
            id: 'welcome',
            role: 'assistant',
            content: WELCOME_MESSAGE,
            timestamp: new Date(),
          },
        ],
        isFirstOpen: false,
        showMenu: true,
      });
    }
  }, [state.isFirstOpen]);

  const addUserMessage = useCallback((content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      showMenu: false,
    }));
  }, []);

  const addAssistantMessage = useCallback((content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  }, []);

  const handleOptionClick = useCallback(
    (optionNumber: number) => {
      const optionTexts = [
        'Report a problem or issue (pothole, unsafe building, code violation, etc.)',
        'File a formal complaint (police conduct, official misconduct, FOIA denial, etc.)',
        'Request information or submit a FOIA request',
        'Start or join a campaign / petition',
        'Browse local issues or see what\'s happening in my area',
        'Something else (suggestion, question, general inquiry)',
      ];

      const selectedText = optionTexts[optionNumber - 1];
      if (selectedText) {
        addUserMessage(`${optionNumber}. ${selectedText}`);
      }

      return optionNumber;
    },
    [addUserMessage]
  );

  const handleFreeTextSubmit = useCallback(
    (text: string) => {
      if (!text.trim()) return null;

      const trimmedText = text.trim();
      
      // Check if input is a simple number 1-6
      const numberMatch = trimmedText.match(/^[1-6]$/);
      if (numberMatch) {
        const optionNumber = parseInt(numberMatch[0], 10);
        return handleOptionClick(optionNumber);
      }

      // Try keyword matching for free-text routing
      const matchedOption = matchKeywordToOption(trimmedText);
      if (matchedOption !== null) {
        addUserMessage(trimmedText);
        setTimeout(() => {
          addAssistantMessage(
            `I understand you're interested in option ${matchedOption}. Let me direct you there...`
          );
        }, 300);
        return matchedOption;
      }

      // Otherwise, treat as free text with fallback
      addUserMessage(trimmedText);
      
      // Add fallback response
      setTimeout(() => {
        addAssistantMessage(
          'Thanks for sharing that! I\'m not quite sure which option matches best. Could you please pick the closest option from the menu below?'
        );
        setState((prev) => ({
          ...prev,
          showMenu: true,
        }));
      }, 300);

      return null;
    },
    [addUserMessage, addAssistantMessage, handleOptionClick]
  );

  const returnToMenu = useCallback(() => {
    addAssistantMessage(MENU_MESSAGE);
    setState((prev) => ({
      ...prev,
      showMenu: true,
    }));
  }, [addAssistantMessage]);

  const resetChat = useCallback(() => {
    setState({
      messages: [
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: WELCOME_MESSAGE,
          timestamp: new Date(),
        },
      ],
      isFirstOpen: false,
      showMenu: true,
    });
  }, []);

  return {
    messages: state.messages,
    isFirstOpen: state.isFirstOpen,
    showMenu: state.showMenu,
    initializeChat,
    handleOptionClick,
    handleFreeTextSubmit,
    addAssistantMessage,
    returnToMenu,
    resetChat,
  };
}
