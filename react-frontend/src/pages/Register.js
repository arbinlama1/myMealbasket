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
  useTheme,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Phone,
  Home,
  Store,
  Restaurant,
  Login,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { register, loading, error, clearError } = useAuth();
  
  const [userType, setUserType] = useState('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    businessName: '',
    businessType: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Simple validation function
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
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
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (userType === 'vendor') {
      if (!formData.businessName.trim()) {
        errors.businessName = 'Business name is required';
      }
      if (!formData.businessType) {
        errors.businessType = 'Business type is required';
      }
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
      }
      if (!formData.address.trim()) {
        errors.address = 'Address is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    // Clear authentication error when user starts typing
    if (error) {
      clearError();
    }
  };

  // Manual registration function - NO AUTO-ANYTHING
  const handleManualRegister = async () => {
    console.log('=== REGISTRATION DEBUG START ===');
    console.log('Manual register button clicked for:', userType);
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    console.log('Starting manual registration for:', formData.email);
    
    const { confirmPassword, ...registerData } = formData;
    console.log('Register data (without confirm):', registerData);
    
    let result;
    
    try {
      if (userType === 'vendor') {
        console.log('=== VENDOR REGISTRATION ===');
        // Use vendor registration API
        const vendorData = {
          name: registerData.name || '',
          email: registerData.email || '',
          password: registerData.password || '',
          shopName: registerData.businessName || '',
          businessType: registerData.businessType || '',
          phone: registerData.phone || '',
          address: registerData.address || ''
        };
        
        console.log('=== VENDOR REGISTRATION DEBUG ===');
        console.log('userType:', userType);
        console.log('registerData:', registerData);
        console.log('Final vendorData:', vendorData);
        console.log('JSON.stringify(vendorData):', JSON.stringify(vendorData));
        
        // Validate data before sending
        if (!vendorData.name || !vendorData.email || !vendorData.password || !vendorData.shopName || !vendorData.businessType || !vendorData.phone || !vendorData.address) {
          console.error('Missing required vendor fields:', {
            name: !!vendorData.name,
            email: !!vendorData.email,
            password: !!vendorData.password,
            shopName: !!vendorData.shopName,
            businessType: !!vendorData.businessType,
            phone: !!vendorData.phone,
            address: !!vendorData.address
          });
          alert('Please fill in all required vendor fields');
          return;
        }
        
        // Try direct fetch for vendor
        try {
          console.log('Trying direct fetch for vendor...');
          const fetchResponse = await fetch('http://localhost:8081/api/auth/register/vendor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(vendorData)
          });
          
          const fetchResult = await fetchResponse.json();
          console.log('Direct vendor fetch result:', fetchResult);
          
          if (fetchResult.success) {
            result = { success: true, data: fetchResult };
          } else {
            result = { success: false, error: fetchResult.message || 'Vendor registration failed' };
          }
        } catch (fetchError) {
          console.log('Direct vendor fetch failed, trying axios...');
          result = await authAPI.registerVendor(vendorData);
        }
        
        console.log('Vendor data being sent:', vendorData);
        console.log('Vendor registration response:', result);
        console.log('Vendor response success:', result.data?.success);
      } else {
        console.log('=== USER REGISTRATION ===');
        // Use regular user registration API
        const userData = {
          name: registerData.name || '',
          email: registerData.email || '',
          password: registerData.password || '',
          role: userType.toUpperCase()
        };
        
        console.log('=== USER REGISTRATION DEBUG ===');
        console.log('userType:', userType);
        console.log('userType.toUpperCase():', userType.toUpperCase());
        console.log('registerData:', registerData);
        console.log('Final userData:', userData);
        console.log('JSON.stringify(userData):', JSON.stringify(userData));
        
        // Validate data before sending
        if (!userData.name || !userData.email || !userData.password) {
          console.error('Missing required fields:', {
            name: !!userData.name,
            email: !!userData.email,
            password: !!userData.password
          });
          alert('Please fill in all required fields');
          return;
        }
        
        // Try direct fetch as fallback
        try {
          console.log('Trying direct fetch...');
          const fetchResponse = await fetch('http://localhost:8081/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
          });
          
          const fetchResult = await fetchResponse.json();
          console.log('Direct fetch result:', fetchResult);
          
          if (fetchResult.success) {
            result = { success: true, data: fetchResult };
          } else {
            result = { success: false, error: fetchResult.message || 'Registration failed' };
          }
        } catch (fetchError) {
          console.log('Direct fetch failed, trying axios...');
          result = await register(userData);
        }
        
        console.log('User registration response:', result);
      }
      
      console.log('=== CHECKING RESULT ===');
      console.log('Result:', result);
      console.log('Result.success:', result.success);
      console.log('Result.data:', result.data);
      console.log('Result.data?.success:', result.data?.success);
      
      // Handle both direct API response and AuthContext response
      const isSuccess = result.data?.success || result.success;
      const errorMsg = result.data?.error || result.error || 'Unknown error occurred';
      
      console.log('Is success:', isSuccess);
      console.log('Error message:', errorMsg);
      
      if (isSuccess) {
        console.log('=== REGISTRATION SUCCESS ===');
        console.log('Registration successful for:', userType);
        
        // Show success message
        alert(`Registration successful! Please login to continue.`);
        
        // Reset form completely
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          address: '',
          businessName: '',
          businessType: ''
        });
        setFormErrors({});
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        
      } else {
        console.error('=== REGISTRATION FAILED ===');
        console.error('Registration error:', result);
        alert(`Registration failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('=== REGISTRATION EXCEPTION ===');
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      const errorMsg = error.response?.data?.error || error.message || 'Registration failed';
      console.error('Final error message:', errorMsg);
      alert('Registration failed: ' + errorMsg);
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
              MealBasket
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>
              Create your account
            </Typography>
          </Box>

          {/* User Type Selection */}
          <Box sx={{ width: '100%', mb: 3 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">I want to:</FormLabel>
              <RadioGroup
                row
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <FormControlLabel 
                  value="customer" 
                  control={<Radio />} 
                  label="Order Product" 
                />
                <FormControlLabel 
                  value="vendor" 
                  control={<Radio />} 
                  label="Sell Product" 
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {formErrors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.submit}
            </Alert>
          )}

          {/* Registration Form - NO onSubmit, NO auto-anything */}
          <Box sx={{ width: '100%' }}>
            {/* Common Fields */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              autoFocus
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email Address"
              type="email"
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
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />

            {/* Vendor Specific Fields */}
            {userType === 'vendor' && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="businessName"
                  label="Business Name"
                  value={formData.businessName}
                  onChange={handleChange}
                  error={!!formErrors.businessName}
                  helperText={formErrors.businessName}
                  InputProps={{
                    startAdornment: <Store sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="businessType"
                  label="Business Type"
                  value={formData.businessType}
                  onChange={handleChange}
                  error={!!formErrors.businessType}
                  helperText={formErrors.businessType}
                  InputProps={{
                    startAdornment: <Restaurant sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="address"
                  label="Address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: <Home sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 2 }} />,
                  }}
                />
              </>
            )}

            {/* MANUAL REGISTER BUTTON - NO AUTO-CLICK */}
            <Button
              type="button"
              fullWidth
              variant="contained"
              disabled={loading}
              onClick={handleManualRegister}
              sx={{ mt: 3, mb: 2 }}
              startIcon={loading ? <CircularProgress size={20} /> : <Login />}
            >
              {loading ? 'Registering...' : `📝 Register as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
            </Button>
            
            <Box textAlign="center" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ color: theme.palette.primary.main }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
