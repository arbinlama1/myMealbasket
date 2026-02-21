import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert,
  CircularProgress, useTheme, Radio, RadioGroup, FormControlLabel,
  FormControl, FormLabel, MenuItem,
} from '@mui/material';
import { Person, Email, Lock, Phone, Home, Store, Restaurant, Login } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { register, loading, error, clearError } = useAuth();

  const [userType, setUserType] = useState('customer');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', address: '', businessName: '', businessType: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
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
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (userType === 'vendor') {
      if (!formData.businessName.trim()) errors.businessName = 'Business name is required';
      if (!formData.businessType) errors.businessType = 'Business type is required';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!formData.address.trim()) errors.address = 'Address is required';
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
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    const { confirmPassword, ...data } = formData;
    let result;

    try {
      if (userType === 'vendor') {
        const res = await authAPI.registerVendor({
          name: data.name,
          email: data.email,
          password: data.password,
          shopName: data.businessName,
          businessType: data.businessType,
          phone: data.phone,
          address: data.address,
        });
        result = res.data.success
          ? { success: true }
          : { success: false, error: res.data.message };
      } else {
        result = await register({ ...data, role: 'USER' });
      }

      if (result.success) {
        setSuccessMsg('Registration successful! Redirecting to login…');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      // Error already handled via context / local state
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <Paper elevation={10} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">🍽️ MealBasket</Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>Create your account</Typography>
          </Box>

          {/* Account type */}
          <Box sx={{ width: '100%', mb: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">I want to:</FormLabel>
              <RadioGroup row value={userType} onChange={(e) => setUserType(e.target.value)}>
                <FormControlLabel value="customer" control={<Radio />} label="Order Products" />
                <FormControlLabel value="vendor" control={<Radio />} label="Sell Products" />
              </RadioGroup>
            </FormControl>
          </Box>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          {successMsg && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{successMsg}</Alert>}

          {/* FIX: wrap in <form> */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField margin="normal" required fullWidth name="name" label="Full Name" value={formData.name} onChange={handleChange} error={!!formErrors.name} helperText={formErrors.name} autoFocus InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} /> }} />
            <TextField margin="normal" required fullWidth name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} error={!!formErrors.email} helperText={formErrors.email} InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} /> }} />
            <TextField margin="normal" required fullWidth name="password" label="Password" type="password" value={formData.password} onChange={handleChange} error={!!formErrors.password} helperText={formErrors.password} InputProps={{ startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} /> }} />
            <TextField margin="normal" required fullWidth name="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} error={!!formErrors.confirmPassword} helperText={formErrors.confirmPassword} InputProps={{ startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} /> }} />

            {userType === 'vendor' && (
              <>
                <TextField margin="normal" required fullWidth name="businessName" label="Business Name" value={formData.businessName} onChange={handleChange} error={!!formErrors.businessName} helperText={formErrors.businessName} InputProps={{ startAdornment: <Store sx={{ mr: 1, color: 'action.active' }} /> }} />
                <TextField
                  margin="normal" required fullWidth select name="businessType" label="Business Type"
                  value={formData.businessType} onChange={handleChange} error={!!formErrors.businessType} helperText={formErrors.businessType}
                  InputProps={{ startAdornment: <Restaurant sx={{ mr: 1, color: 'action.active' }} /> }}
                >
                  {['Food', 'Drinks', 'Clothing', 'Electronics'].map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
                <TextField margin="normal" required fullWidth name="phone" label="Phone Number" value={formData.phone} onChange={handleChange} error={!!formErrors.phone} helperText={formErrors.phone} InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} /> }} />
                <TextField margin="normal" required fullWidth multiline rows={2} name="address" label="Address" value={formData.address} onChange={handleChange} error={!!formErrors.address} helperText={formErrors.address} InputProps={{ startAdornment: <Home sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 2 }} /> }} />
              </>
            )}

            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2 }} startIcon={loading ? <CircularProgress size={20} /> : <Login />}>
              {loading ? 'Registering…' : `📝 Register as ${userType === 'vendor' ? 'Vendor' : 'Customer'}`}
            </Button>

            <Box textAlign="center" sx={{ mt: 1 }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>Sign In</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;