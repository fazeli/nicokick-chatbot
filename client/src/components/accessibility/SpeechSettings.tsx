import React, { useState, useEffect } from 'react';
import { useSpeech } from '@/hooks/use-speech';

interface SpeechSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpeechSettings: React.FC<SpeechSettingsProps> = ({ isOpen, onClose }) => {
  const { voices, isSupported } = useSpeech();
  
  const [rate, setRate] = useState(() => {
    const saved = localStorage.getItem('speechRate');
    return saved ? parseFloat(saved) : 1;
  });
  
  const [pitch, setPitch] = useState(() => {
    const saved = localStorage.getItem('speechPitch');
    return saved ? parseFloat(saved) : 1;
  });
  
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('speechVolume');
    return saved ? parseFloat(saved) : 1;
  });
  
  const [selectedVoice, setSelectedVoice] = useState(() => {
    const saved = localStorage.getItem('speechVoice');
    return saved || '';
  });
  
  // Function to save a setting and dispatch an event for other components
  const saveSetting = (key: string, value: string) => {
    localStorage.setItem(key, value);
    // Dispatch storage event for other components to detect
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      newValue: value
    }));
  };
  
  // Save settings to localStorage when they change
  useEffect(() => {
    saveSetting('speechRate', rate.toString());
    saveSetting('speechPitch', pitch.toString());
    saveSetting('speechVolume', volume.toString());
    if (selectedVoice) {
      saveSetting('speechVoice', selectedVoice);
    }
  }, [rate, pitch, volume, selectedVoice]);
  
  // Play sample text with current settings
  const playSample = () => {
    const utterance = new SpeechSynthesisUtterance('This is a sample of how the voice will sound with these settings.');
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Accessibility Settings</h2>
        
        {!isSupported ? (
          <div className="text-red-600 mb-4">
            Text-to-speech is not supported in your browser.
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speed (Rate): {rate}x
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={rate} 
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pitch: {pitch}
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={pitch} 
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Lower</span>
                <span>Higher</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume: {(volume * 100).toFixed(0)}%
              </label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Quieter</span>
                <span>Louder</span>
              </div>
            </div>
            
            {voices.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice:
                </label>
                <select 
                  value={selectedVoice} 
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Default Voice</option>
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button
              onClick={playSample}
              className="bg-blue-100 text-blue-600 hover:bg-blue-200 py-2 px-4 rounded-md flex items-center gap-2 mb-4 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Test Voice
            </button>
          </>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeechSettings;