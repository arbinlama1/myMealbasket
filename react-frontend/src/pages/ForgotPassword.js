import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.data && response.data.success) {
        // Get reset token and user type for testing
        const resetToken = response.data.data?.resetToken;
        const userType = response.data.data?.userType;
        
        let successMessage = 'Password reset instructions have been sent to your email address.';
        
        if (resetToken) {
          console.log('=== PASSWORD RESET INFO ===');
          console.log('Reset Token:', resetToken);
          console.log('User Type:', userType);
          console.log('Reset Link:', `http://localhost:3000/reset-password/${resetToken}`);
          console.log('========================');
          
          // Show token in UI for testing (in production, remove this)
          successMessage += `\n\n🔧 For Testing:\nToken: ${resetToken}\nReset Link: http://localhost:3000/reset-password/${resetToken}`;
        }
        
        setMessage(successMessage);
        setEmailSent(true);
      } else {
        setError(response.data?.message || 'Failed to send reset email');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No account found with this email address');
      } else if (err.response?.status === 400) {
        setError('Please enter a valid email address');
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Forgot Password
          </Typography>

          {!emailSent ? (
            <>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Send Reset Instructions'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => navigate('/login')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Back to Login
                  </Link>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                  {message}
                </Typography>
              </Alert>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Check your email and follow the instructions to reset your password.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                    setMessage('');
                  }}
                >
                  Send Again
                </Button>
                
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
