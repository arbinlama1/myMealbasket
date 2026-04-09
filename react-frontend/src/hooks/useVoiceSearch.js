import { useState, useEffect, useCallback } from 'react';

const useVoiceSearch = (onSearchResult, options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Default options
  const {
    lang = 'en-US',
    continuous = false,
    interimResults = false,
    showSnackbar = () => {},
    processCommand = (transcript) => transcript,
  } = options;

  // Initialize Voice Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = continuous;
      recognitionInstance.interimResults = interimResults;
      recognitionInstance.lang = lang;
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        showSnackbar('Listening... Speak now!', 'info');
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const processedResult = processCommand(transcript);
        setIsListening(false);
        showSnackbar(`Voice search: "${transcript}"`, 'success');
        
        if (onSearchResult) {
          onSearchResult(processedResult, transcript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        showSnackbar('Voice search failed. Please try again.', 'error');
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
      setVoiceSupported(true);
    } else {
      setVoiceSupported(false);
      console.log('Speech recognition not supported');
    }
  }, [lang, continuous, interimResults]);

  // Voice Search Functions
  const startVoiceSearch = useCallback(() => {
    if (recognition && !isListening) {
      recognition.start();
    }
  }, [recognition, isListening]);

  const stopVoiceSearch = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  return {
    isListening,
    voiceSupported,
    startVoiceSearch,
    stopVoiceSearch,
  };
};

export default useVoiceSearch;
