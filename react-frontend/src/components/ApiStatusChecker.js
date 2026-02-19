import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import { CheckCircle, Error, Refresh } from '@mui/icons-material';

const ApiStatusChecker = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [lastChecked, setLastChecked] = useState(null);

  const API_URL = 'http://localhost:8081/api/user';

  const checkApiStatus = async () => {
    setStatus('checking');
    setMessage('Checking API connection...');
    
    try {
      const response = await axios.get(`${API_URL}/all`, { timeout: 5000 });
      
      if (response.data.success) {
        setStatus('connected');
        setMessage(`API is working! Found ${response.data.data?.length || 0} users`);
      } else {
        setStatus('error');
        setMessage('API responded but returned error');
      }
    } catch (error) {
      setStatus('error');
      if (error.code === 'ECONNREFUSED') {
        setMessage('Backend server is not running. Please start the backend.');
      } else if (error.code === 'NETWORK_ERROR') {
        setMessage('Network error. Check your connection.');
      } else if (error.response?.status === 401) {
        setMessage('Authentication required. Check security configuration.');
      } else {
        setMessage(`API Error: ${error.message}`);
      }
    }
    
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkApiStatus();
    // Auto-check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'success';
      case 'checking': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <CheckCircle />;
      case 'checking': return <Refresh />;
      case 'error': return <Error />;
      default: return null;
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">API Status</Typography>
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={checkApiStatus}
            disabled={status === 'checking'}
          >
            Refresh
          </Button>
        </Box>

        <Box display="flex" alignItems="center" mb={2}>
          <Chip
            icon={getStatusIcon()}
            label={status.toUpperCase()}
            color={getStatusColor()}
            variant="outlined"
            sx={{ mr: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Box>

        {status === 'checking' && <LinearProgress sx={{ mb: 1 }} />}
        
        {status === 'error' && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {message}
          </Alert>
        )}

        {status === 'connected' && (
          <Alert severity="success" sx={{ mb: 1 }}>
            {message}
          </Alert>
        )}

        {lastChecked && (
          <Typography variant="caption" color="text.secondary">
            Last checked: {lastChecked.toLocaleTimeString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiStatusChecker;
