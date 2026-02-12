import { useState, useEffect } from 'react';

export interface SystemVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

export interface UseSystemVoicesResult {
  voices: SystemVoice[];
  isLoading: boolean;
  isSupported: boolean;
}

export function useSystemVoices(): UseSystemVoicesResult {
  const [voices, setVoices] = useState<SystemVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) {
      setIsLoading(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      
      const voiceList: SystemVoice[] = availableVoices.map(voice => ({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
        default: voice.default,
      }));

      setVoices(voiceList);
      setIsLoading(false);
    };

    // Load voices immediately
    loadVoices();

    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported]);

  return {
    voices,
    isLoading,
    isSupported,
  };
}
