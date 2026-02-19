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
  Divider,
  useTheme,
} from '@mui/material';
import {
  Email,
  Lock,
} from '@mui/icons-material';

const SimpleLogin = () => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Simple validation
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

  // Simple manual login - NO AUTO-ANYTHING
  const handleManualLogin = async () => {
    console.log('Manual login button clicked');
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    console.log('Starting manual login with:', formData.email);
    setLoading(true);
    setMessage('');
    
    try {
      // Direct API call - no context, no auto-redirects
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('Login successful:', data);
        
        // Show success message
        setMessage(`✅ Login successful! Welcome ${data.data.name || 'User'}!`);
        
        // Store in localStorage manually
        const userData = {
          id: data.data.id,
          email: data.data.email,
          name: data.data.name,
          role: data.data.role
        };
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Also save to allUsers for admin dashboard tracking
        const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        const existingUserIndex = allUsers.findIndex(u => u.email === userData.email);
        
        if (existingUserIndex === -1) {
          // Add new user to allUsers
          const userForAdmin = {
            ...userData,
            phone: data.data.phone || 'Not provided',
            address: data.data.address || 'Not provided',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isConnected: userData.role === 'VENDOR' ? false : true, // Vendors only connected when have products
            vendorProducts: [],
            productCount: 0,
            lastActivity: userData.role === 'VENDOR' ? 'No products yet' : 'Active'
          };
          
          // Add business info for vendors and connect to their products
          if (userData.role === 'VENDOR') {
            userForAdmin.businessName = data.data.businessName || data.data.shopName || 'Not specified';
            userForAdmin.businessType = data.data.businessType || 'Not specified';
            
            // Connect to existing vendor products if any
            const vendorKey = `vendor_${userData.id}`;
            const existingProducts = JSON.parse(localStorage.getItem('allVendorProducts') || '{}')[vendorKey] || [];
            userForAdmin.vendorProducts = existingProducts;
            userForAdmin.productCount = existingProducts.length;
            userForAdmin.lastActivity = existingProducts.length > 0 ? 'Active' : 'No products yet';
            userForAdmin.isConnected = existingProducts.length > 0; // Only connected if has products
          } else {
            // Non-vendors are always connected once they login
            userForAdmin.isConnected = true;
            userForAdmin.lastActivity = 'Active';
          }
          
          allUsers.push(userForAdmin);
          localStorage.setItem('allUsers', JSON.stringify(allUsers));
          console.log('SimpleLogin: Added new user to allUsers:', userForAdmin);
        } else {
          // Update last login and connection status for existing user
          allUsers[existingUserIndex].lastLogin = new Date().toISOString();
          
          // Update vendor connection status
          if (allUsers[existingUserIndex].role === 'VENDOR') {
            const vendorKey = `vendor_${userData.id}`;
            const existingProducts = JSON.parse(localStorage.getItem('allVendorProducts') || '{}')[vendorKey] || [];
            allUsers[existingUserIndex].vendorProducts = existingProducts;
            allUsers[existingUserIndex].productCount = existingProducts.length;
            allUsers[existingUserIndex].lastActivity = existingProducts.length > 0 ? 'Active' : 'No products yet';
            allUsers[existingUserIndex].isConnected = existingProducts.length > 0; // Only connected if has products
          } else {
            // Non-vendors are always connected once they login
            allUsers[existingUserIndex].isConnected = true;
            allUsers[existingUserIndex].lastActivity = 'Active';
          }
          
          localStorage.setItem('allUsers', JSON.stringify(allUsers));
          console.log('SimpleLogin: Updated last login and connection status for existing user:', userData.email);
        }
        
        // Notify admin dashboard about user login
        window.postMessage({
          type: 'USER_LOGIN',
          userName: userData.name,
          userEmail: userData.email,
          userRole: userData.role
        }, '*');
        
        // Reset form
        setFormData({
          email: '',
          password: ''
        });
        setFormErrors({});
        
        // Role-based redirect
        let redirectUrl = '/user/dashboard'; // default for users
        console.log('User role:', data.data.role);
        if (data.data.role === 'VENDOR') {
          redirectUrl = '/vendor/dashboard';
        } else if (data.data.role === 'ADMIN') {
          redirectUrl = '/admin/dashboard';
        }
        console.log('Redirecting to:', redirectUrl);
        
        // Show success message with role info
        setMessage(`✅ Login successful! Welcome ${data.data.name || 'User'}! Redirecting to ${data.data.role} dashboard...`);
        
        // Simple redirect after 2 seconds
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
        
      } else {
        // API failed, try fallback login
        console.log('API login failed, trying fallback:', data);
        handleFallbackLogin();
      }
    } catch (error) {
      console.log('Login error, trying fallback:', error);
      handleFallbackLogin();
    } finally {
      setLoading(false);
    }
  };

  // Fallback login function for when API is not available
  const handleFallbackLogin = () => {
    console.log('Attempting fallback login...');
    
    // Get users from localStorage
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    // Find user by email
    const user = allUsers.find(u => u.email === formData.email);
    
    if (!user) {
      setMessage('❌ Login failed: User not found. Please register first.');
      return;
    }
    
    // Simple password check (in real app, this would be hashed)
    // Check the actual password from registration
    if (formData.password === user.password || formData.password === 'password123' || formData.password === 'admin123' || formData.password === 'vendor123') {
      console.log('Fallback login successful for:', user);
      
      // Store in localStorage
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      localStorage.setItem('token', 'fallback-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update last login
      const userIndex = allUsers.findIndex(u => u.email === user.email);
      allUsers[userIndex].lastLogin = new Date().toISOString();
      allUsers[userIndex].isConnected = user.role === 'VENDOR' ? allUsers[userIndex].productCount > 0 : true;
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
      
      // Notify admin dashboard
      window.postMessage({
        type: 'USER_LOGIN',
        userName: user.name,
        userEmail: user.email,
        userRole: user.role
      }, '*');
      
      setMessage(`✅ Login successful! Welcome ${user.name}!`);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        const redirectUrl = user.role === 'VENDOR' ? '/vendor/dashboard' : 
                           user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
        console.log('Fallback login - User role:', user.role);
        console.log('Fallback login - Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      }, 2000);
      
    } else {
      setMessage('❌ Login failed: Incorrect password. Use your registered password or try defaults: "password123", "vendor123", or "admin123"');
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

            {/* MANUAL LOGIN BUTTON */}
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
              <Button
                type="button"
                onClick={() => window.location.href = '/register'}
                sx={{ textTransform: 'none' }}
              >
                <Typography variant="body2" color="primary.main">
                  Don't have an account? Sign Up
                </Typography>
              </Button>
            </Box>
          </Box>

          <Divider sx={{ width: '100%', my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              DEMO ACCOUNTS
            </Typography>
          </Divider>

          {/* Demo Account Info */}
          <Alert
            severity="info"
            sx={{ mt: 3, width: '100%' }}
          >
            <Typography variant="body2">
              <strong>User:</strong> user@test.com / password123<br/>
              <strong>Vendor:</strong> vendor@test.com / vendor123<br/>
              <strong>Admin:</strong> admin@test.com / admin123
            </Typography>
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
};

export default SimpleLogin;
