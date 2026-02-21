import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert,
  CircularProgress, Divider, useTheme,
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ROLE_REDIRECT = { ADMIN: '/admin/dashboard', VENDOR: '/vendor', USER: '/' };

const SimpleLogin = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Minimum 6 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: '' }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!validate()) return;
    const result = await login(formData);
    if (result.success) navigate(ROLE_REDIRECT[result.user?.role] || '/');
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

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal" required fullWidth label="Email Address" name="email"
              autoComplete="email" autoFocus value={formData.email} onChange={handleChange}
              error={!!formErrors.email} helperText={formErrors.email}
              InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} /> }}
            />
            <TextField
              margin="normal" required fullWidth name="password" label="Password"
              type="password" autoComplete="current-password" value={formData.password}
              onChange={handleChange} error={!!formErrors.password} helperText={formErrors.password}
              InputProps={{ startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} /> }}
            />

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 2, py: 1.5 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : '🔑 Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary.main">
                  Don&apos;t have an account? Sign Up
                </Typography>
              </Link>
            </Box>
          </Box>

          <Divider sx={{ width: '100%', my: 3 }}>
            <Typography variant="body2" color="text.secondary">DEMO ACCOUNTS</Typography>
          </Divider>

          <Alert severity="info" sx={{ width: '100%' }}>
            <Typography variant="body2">
              <strong>User:</strong> user@test.com / password123<br />
              <strong>Vendor:</strong> vendor@test.com / vendor123<br />
              <strong>Admin:</strong> admin@test.com / admin123
            </Typography>
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
};

export default SimpleLogin;