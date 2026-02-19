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
  useTheme,
  MenuItem,
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

const SimpleRegister = () => {
  const theme = useTheme();
  
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Simple validation
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
    
    // Clear message when user starts typing
    if (message) {
      setMessage('');
    }
  };

  // Simple manual registration - NO AUTO-ANYTHING
  const handleManualRegister = async () => {
    console.log('Manual register button clicked for:', userType);
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    console.log('Starting manual registration for:', formData.email);
    setLoading(true);
    setMessage('');
    
    try {
      const { confirmPassword, ...registerData } = formData;
      
      let url, payload;
      
      if (userType === 'vendor') {
        // Vendor registration
        url = 'http://localhost:8081/api/auth/register/vendor';
        payload = {
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          shopName: registerData.businessName,
          businessType: registerData.businessType,
          phone: registerData.phone,
          address: registerData.address
        };
      } else {
        // User registration
        url = 'http://localhost:8081/api/auth/register';
        payload = {
          ...registerData,
          role: userType.toUpperCase()
        };
      }
      
      let registrationSuccess = false;
      let userData = null;
      
      try {
        // Try API call first
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          console.log('Registration successful via API:', data);
          registrationSuccess = true;
          userData = data.data;

          // Show success message
          setMessage(`✅ ${userType === 'vendor' ? 'Vendor' : 'User'} registered successfully! Please login.`);
          
          // ALSO save to allUsers for admin dashboard tracking even when API succeeds
          const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
          
          // Check if user already exists
          const existingUser = allUsers.find(u => u.email === userData.email);
          if (!existingUser) {
            // Add user with complete information for admin dashboard
            const userForAdmin = {
              ...userData,
              phone: userData.phone || 'Not provided',
              address: userData.address || 'Not provided',
              createdAt: new Date().toISOString(),
              lastLogin: null,
              isConnected: userData.role === 'VENDOR' ? false : true, // Vendors only connected when have products
              vendorProducts: [],
              productCount: 0,
              lastActivity: userData.role === 'VENDOR' ? 'No products yet' : 'Active',
              password: registerData.password // Save the actual password
            };
            
            // Add business info for vendors
            if (userData.role === 'VENDOR') {
              userForAdmin.businessName = userData.businessName || userData.shopName || 'Not specified';
              userForAdmin.businessType = userData.businessType || 'Not specified';
            }
            
            allUsers.push(userForAdmin);
            localStorage.setItem('allUsers', JSON.stringify(allUsers));
            console.log('SimpleRegister: Added API-registered user to allUsers:', userForAdmin);
            
            // Send real-time notification to admin dashboard
            window.postMessage({
              type: 'USER_REGISTERED',
              userName: userForAdmin.name,
              userEmail: userForAdmin.email,
              userRole: userForAdmin.role,
              businessName: userForAdmin.businessName || null,
              timestamp: new Date().toISOString()
            }, '*');
            
            console.log('SimpleRegister: Sent real-time notification to admin dashboard');
          }

          // Reset form after successful registration and redirect to login page
          setTimeout(() => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              address: '',
              password: '',
              confirmPassword: '',
              businessName: '',
              businessType: ''
            });
            setFormErrors({});
            window.location.href = '/login';
          }, 1500);
        } else {
          throw new Error('API registration failed');
        }
      } catch (apiError) {
        console.log('API registration failed, using localStorage fallback:', apiError);
        
        // Save to localStorage as fallback
        const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        
        // Check if user already exists
        const existingUser = allUsers.find(u => u.email === registerData.email);
        if (existingUser) {
          setMessage('⚠️ User with this email already exists!');
          return;
        }
        
        // Add user with complete information for admin dashboard
        const userForAdmin = {
          ...registerData,
          id: Date.now(), // Generate unique ID
          createdAt: new Date().toISOString(),
          lastLogin: null,
          role: userType.toUpperCase(),
          isConnected: userType === 'vendor' ? false : true, // Vendors only connected when have products
          vendorProducts: [],
          productCount: 0,
          lastActivity: userType === 'vendor' ? 'No products yet' : 'Active',
          password: registerData.password, // Save the actual password
          ...(userType === 'vendor' && {
            businessName: registerData.businessName,
            businessType: registerData.businessType,
            shopName: registerData.businessName
          })
        };
        
        allUsers.push(userForAdmin);
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
        console.log('SimpleRegister: Added user to allUsers:', userForAdmin);
        
        // Send real-time notification to admin dashboard
        window.postMessage({
          type: 'USER_REGISTERED',
          userName: userForAdmin.name,
          userEmail: userForAdmin.email,
          userRole: userForAdmin.role,
          businessName: userForAdmin.businessName || null,
          timestamp: new Date().toISOString()
        }, '*');
        
        console.log('SimpleRegister: Sent real-time notification to admin dashboard (fallback)');
        
        // Also save as current user for immediate login
        localStorage.setItem('user', JSON.stringify({
          id: userForAdmin.id,
          email: userForAdmin.email,
          name: userForAdmin.name,
          role: userForAdmin.role
        }));
        
        // Generate a simple token for localStorage
        const simpleToken = btoa(`${userForAdmin.email}:${Date.now()}`);
        localStorage.setItem('token', simpleToken);
        
        console.log('User registered via localStorage fallback:', userForAdmin);
        
        // Show success message
        setMessage(`✅ ${userType === 'vendor' ? 'Vendor' : 'User'} registered successfully! Please login.`);
        
        // Notify admin dashboard about new registration
        window.postMessage({
          type: userType === 'vendor' ? 'VENDOR_REGISTERED' : 'USER_REGISTERED',
          userName: registerData.name,
          userEmail: registerData.email,
          userRole: userType.toUpperCase(),
          vendorName: userType === 'vendor' ? registerData.businessName : null
        }, '*');
        
        // Reset form after successful registration
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            password: '',
            confirmPassword: '',
            businessName: '',
            businessType: ''
          });
          setFormErrors({});
          // Redirect to login page
          window.location.href = '/login';
        }, 2000);
        
        registrationSuccess = true;
      }
      
      if (!registrationSuccess) {
        setMessage(`❌ Registration failed: Registration failed`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('❌ Registration failed. Please try again.');
    } finally {
      setLoading(false);
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

          {/* Message Display */}
          {message && (
            <Alert severity={message.includes('✅') ? 'success' : 'error'} sx={{ width: '100%', mb: 2 }}>
              {message}
            </Alert>
          )}

          {/* Error Display */}
          {Object.keys(formErrors).length > 0 && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              Please fix the errors below
            </Alert>
          )}

          {/* Simple Form - NO onSubmit, NO form element */}
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
                  select
                  InputProps={{
                    startAdornment: <Restaurant sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                >
                  <MenuItem value="Online Cloth">Online Cloth</MenuItem>
                  <MenuItem value="Electronic">Electronic</MenuItem>
                  <MenuItem value="Food">Food</MenuItem>
                  <MenuItem value="Drinks">Drinks</MenuItem>
                </TextField>
                
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

            {/* MANUAL REGISTER BUTTON */}
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
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                type="button"
                onClick={() => window.location.href = '/simple-login'}
                sx={{ textTransform: 'none' }}
              >
                <Typography variant="body2" color="primary.main">
                  Already have an account? Sign In
                </Typography>
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SimpleRegister;
