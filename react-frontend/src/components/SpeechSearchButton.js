import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Mic,
  MicOff,
  Search,
} from '@mui/icons-material';
import speechService from '../services/speechService';

const SpeechSearchButton = ({ onSearchResult, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsSupported(speechService.isSupportedBrowser());
  }, []);

  useEffect(() => {
    if (speechService.isSupportedBrowser()) {
      speechService.onResult = handleSpeechResult;
      speechService.onError = handleSpeechError;
      speechService.onEnd = handleSpeechEnd;
    }

    return () => {
      if (isListening) {
        speechService.stopListening();
      }
    };
  }, [isListening]);

  const handleSpeechResult = (result) => {
    if (result.isFinal) {
      const finalText = result.final.trim();
      setTranscript(finalText);
      
      if (finalText && onSearchResult) {
        onSearchResult(finalText);
      }
      
      stopListening();
    } else {
      setTranscript(result.interim);
    }
  };

  const handleSpeechError = (error) => {
    console.error('Speech recognition error:', error);
    setError(`Speech recognition error: ${error}`);
    setIsListening(false);
    setTranscript('');
  };

  const handleSpeechEnd = () => {
    setIsListening(false);
  };

  const startListening = () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    try {
      setError('');
      setTranscript('');
      setIsListening(true);
      speechService.startListening();
    } catch (err) {
      setError('Failed to start speech recognition');
      console.error('Failed to start speech recognition:', err);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (speechService.isSupportedBrowser()) {
      speechService.stopListening();
    }
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <Tooltip title="Speech recognition not supported">
        <span>
          <IconButton disabled>
            <MicOff color="action" />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Tooltip title={isListening ? "Stop listening" : "Search with voice"}>
        <IconButton
          onClick={handleClick}
          disabled={disabled}
          sx={{
            backgroundColor: isListening ? 'error.main' : 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: isListening ? 'error.dark' : 'primary.dark',
            },
            transition: 'all 0.3s ease',
            animation: isListening ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)',
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)',
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
              },
            },
          }}
        >
          {isListening ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <Mic />
          )}
        </IconButton>
      </Tooltip>

      {/* Speech indicator */}
      {isListening && (
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'black',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 1,
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
          }}
        >
          Listening...
        </Box>
      )}

      {/* Transcript display */}
      {transcript && (
        <Box
          sx={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            padding: 1,
            minWidth: 200,
            maxWidth: 300,
            boxShadow: 2,
            zIndex: 1000,
          }}
        >
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Search fontSize="small" color="primary" />
            {transcript}
          </Typography>
        </Box>
      )}

      {/* Error display */}
      {error && (
        <Alert
          severity="error"
          sx={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 250,
            maxWidth: 300,
            zIndex: 1000,
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default SpeechSearchButton;
