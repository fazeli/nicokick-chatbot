import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSpeech } from './use-speech';

// Define the context type
interface SpeechContextType {
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  speechOptions: {
    rate: number;
    pitch: number;
    volume: number;
    voice: SpeechSynthesisVoice | null;
  };
}

// Create the context with a default value
const SpeechContext = createContext<SpeechContextType>({
  isSettingsOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
  speechOptions: {
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null
  }
});

interface SpeechProviderProps {
  children: ReactNode;
}

export const SpeechProvider: React.FC<SpeechProviderProps> = ({ children }) => {
  const { voices } = useSpeech();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Load speech settings from localStorage
  const [speechOptions, setSpeechOptions] = useState({
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null as SpeechSynthesisVoice | null
  });
  
  // Load saved settings when component mounts
  useEffect(() => {
    const savedRate = localStorage.getItem('speechRate');
    const savedPitch = localStorage.getItem('speechPitch');
    const savedVolume = localStorage.getItem('speechVolume');
    const savedVoiceName = localStorage.getItem('speechVoice');
    
    setSpeechOptions({
      rate: savedRate ? parseFloat(savedRate) : 1,
      pitch: savedPitch ? parseFloat(savedPitch) : 1,
      volume: savedVolume ? parseFloat(savedVolume) : 1,
      voice: null // Will be set in the next useEffect when voices are loaded
    });
  }, []);
  
  // Update voice when voices are loaded
  useEffect(() => {
    if (voices.length > 0) {
      const savedVoiceName = localStorage.getItem('speechVoice');
      if (savedVoiceName) {
        const voice = voices.find(v => v.name === savedVoiceName) || null;
        setSpeechOptions(prev => ({ ...prev, voice }));
      }
    }
  }, [voices]);
  
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  
  return (
    <SpeechContext.Provider value={{ 
      isSettingsOpen, 
      openSettings, 
      closeSettings,
      speechOptions
    }}>
      {children}
    </SpeechContext.Provider>
  );
};

// Custom hook to use the speech context
export const useSpeechContext = () => useContext(SpeechContext);