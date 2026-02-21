import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert,
  CircularProgress, Divider, useTheme,
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ROLE_REDIRECT = {
  ADMIN: '/admin/dashboard',
  VENDOR: '/vendor',
  USER: '/',
};

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    // Support both button click and Enter key via form onSubmit
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    const result = await login(formData);
    if (result.success) {
      navigate(ROLE_REDIRECT[result.user?.role] || '/');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <Paper elevation={10} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">🍽️ MealBasket</Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>Sign in to your account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          {/* FIX: Use a <form> with onSubmit so Enter key works */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} /> }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{ startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} /> }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '🔑 Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary.main">Forgot your password?</Typography>
              </Link>
            </Box>
          </Box>

          <Divider sx={{ width: '100%', my: 3 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>

          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Link to="/register" style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                Sign Up
              </Link>
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mt: 3, width: '100%' }}>
            <Typography variant="body2">
              <strong>Demo User:</strong> user@test.com / password123<br />
              <strong>Demo Vendor:</strong> vendor@test.com / vendor123<br />
              <strong>Demo Admin:</strong> admin@test.com / admin123
            </Typography>
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;