import { useState, useCallback, useRef } from 'react';

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

interface TextToSpeechState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isLoading: boolean;
  voices: SpeechSynthesisVoice[];
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const {
    rate = 0.9,
    pitch = 1,
    volume = 0.8,
    voice = null,
  } = options;

  const [state, setState] = useState<TextToSpeechState>({
    isSupported: 'speechSynthesis' in window,
    isSpeaking: false,
    isPaused: false,
    isLoading: false,
    voices: [],
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  const loadVoices = useCallback(() => {
    if ('speechSynthesis' in window) {
      const availableVoices = speechSynthesis.getVoices();
      setState(prev => ({ ...prev, voices: availableVoices }));
    }
  }, []);

  // Load voices on component mount and when voices change
  useState(() => {
    if ('speechSynthesis' in window) {
      loadVoices();
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  });

  const speak = useCallback((text: string, customOptions?: Partial<UseTextToSpeechOptions>) => {
    if (!state.isSupported) {
      console.warn('Text-to-speech is not supported in this browser');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Apply options
    utterance.rate = customOptions?.rate ?? rate;
    utterance.pitch = customOptions?.pitch ?? pitch;
    utterance.volume = customOptions?.volume ?? volume;
    utterance.voice = customOptions?.voice ?? voice;

    // Event handlers
    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true, isPaused: false }));
    };

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }));
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }));
    };

    utterance.onpause = () => {
      setState(prev => ({ ...prev, isPaused: true }));
    };

    utterance.onresume = () => {
      setState(prev => ({ ...prev, isPaused: false }));
    };

    speechSynthesis.speak(utterance);
  }, [state.isSupported, rate, pitch, volume, voice]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }));
  }, []);

  const pause = useCallback(() => {
    if (state.isSpeaking && !state.isPaused) {
      speechSynthesis.pause();
    }
  }, [state.isSpeaking, state.isPaused]);

  const resume = useCallback(() => {
    if (state.isSpeaking && state.isPaused) {
      speechSynthesis.resume();
    }
  }, [state.isSpeaking, state.isPaused]);

  // Accessibility helper function to read page content
  const readPageContent = useCallback(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      const textContent = mainContent.textContent?.replace(/\s+/g, ' ').trim();
      if (textContent) {
        // Read first 500 characters to avoid overwhelming the user
        const truncatedText = textContent.substring(0, 500) + (textContent.length > 500 ? '...' : '');
        speak(truncatedText);
      }
    }
  }, [speak]);

  // Accessibility helper to announce navigation
  const announceNavigation = useCallback((message: string) => {
    speak(message, { rate: 1.1, volume: 0.9 });
  }, [speak]);

  // Accessibility helper to announce notifications
  const announceNotification = useCallback((message: string) => {
    speak(message, { rate: 1.0, volume: 1.0, pitch: 1.1 });
  }, [speak]);

  return {
    ...state,
    speak,
    stop,
    pause,
    resume,
    readPageContent,
    announceNavigation,
    announceNotification,
  };
}
