import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

interface UseSpeechResult {
  speak: (text: string) => void;
  stop: () => void;
  isPaused: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  togglePause: () => void;
}

export const useSpeech = (options: UseSpeechOptions = {}): UseSpeechResult => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  
  // Use refs to keep track of the current utterance
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Initialize and load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
      
      // Cleanup speechSynthesis when component unmounts
      return () => {
        if (utteranceRef.current) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);
  
  // Function to speak text
  const speak = useCallback((text: string) => {
    if (!isSupported) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    // Set voice if provided and valid
    if (options.voice) {
      utterance.voice = options.voice;
    }
    
    // Set event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);
    
    // Store the utterance in ref
    utteranceRef.current = utterance;
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  }, [isSupported, options.rate, options.pitch, options.volume, options.voice]);
  
  // Function to stop speaking
  const stop = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);
  
  // Function to toggle pause/resume
  const togglePause = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking, isPaused]);
  
  return {
    speak,
    stop,
    isPaused,
    isSpeaking,
    isSupported,
    voices,
    togglePause,
  };
};