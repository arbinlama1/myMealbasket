import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Simple validation function
  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific validation error
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear global auth error when user types
    if (error) {
      clearError();
    }
  };

  // Login handler
  const handleManualLogin = async () => {
    console.log('Manual login button clicked');

    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    // Clear any previous authentication error before new attempt
    clearError();

    console.log('Starting login attempt with:', formData.email);

    try {
      const result = await login(formData);

      if (result.success) {
        console.log('Login successful → redirecting based on role');

        // Reset form
        setFormData({ email: '', password: '' });
        setFormErrors({});

        // Role-based navigation
        const role = result.user?.role?.toUpperCase();
        if (role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (role === 'VENDOR') {
          navigate('/vendor/dashboard');
        } else {
          navigate('/meal-planner'); // or '/dashboard' depending on your route
        }
      }
      // No else needed — if login fails, AuthContext should set error state
      // which will be shown via the <Alert> below
    } catch (err) {
      console.error('Login error:', err);
      // Optional: if your login() function in context doesn't set error,
      // you could handle fallback here — but ideally context does it.
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">
              🍽️ MealBasket
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>
              Sign in to your account
            </Typography>
          </Box>

          {/* Error Alert — uses context error */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />

            {/* Login Button */}
            <Button
              type="button"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              onClick={handleManualLogin}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '🔑 Sign In'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary.main">
                  Forgot your password?
                </Typography>
              </Link>
            </Box>
          </Box>

          <Divider sx={{ width: '100%', my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Register Link */}
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>

          {/* Demo Account Info */}
          <Alert severity="info" sx={{ mt: 3, width: '100%' }} title="Demo Account">
            <Typography variant="body2">
              <strong>Demo User:</strong> user@example.com / password123<br />
              <strong>Demo Admin:</strong> admin@example.com / admin123
            </Typography>
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;