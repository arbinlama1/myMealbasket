import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  SupportAgent,
  Business,
  ArrowBack,
  Home,
} from '@mui/icons-material';
import { contactAPI } from '../services/api';

const Contact = () => {
  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await contactAPI.sendMessage(formData);
      if (response.data.success) {
        setFormData({ name: '', email: '', subject: '', message: '' });
        showSnackbar('Message sent successfully!', 'success');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      showSnackbar('Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 40, color: '#2E7D32' }} />,
      title: 'Email Us',
      details: ['info@mealtbasket.com', 'support@mealtbasket.com'],
      primary: 'info@mealtbasket.com'
    },
    {
      icon: <Phone sx={{ fontSize: 40, color: '#FF6B35' }} />,
      title: 'Call Us',
      details: ['+977-9876543210', '+977-9865432109'],
      primary: '+977-9876543210'
    },
    {
      icon: <LocationOn sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Visit Us',
      details: ['Kathmandu, Nepal', 'Patan, Nepal'],
      primary: 'Kathmandu, Nepal'
    }
  ];

  const departments = [
    {
      icon: <SupportAgent sx={{ fontSize: 30, color: '#4CAF50' }} />,
      title: 'Customer Support',
      email: 'support@mealtbasket.com',
      phone: '+977-9876543210'
    },
    {
      icon: <Business sx={{ fontSize: 30, color: '#FF6B35' }} />,
      title: 'Business Partnerships',
      email: 'business@mealtbasket.com',
      phone: '+977-9865432109'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackToHome}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Contact Us
          </Typography>
          
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Home />}
            onClick={handleBackToHome}
          >
            Return to Home
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Header */}
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            Contact Us
          </Typography>
          <Typography variant="h6" color="text.secondary">
            We're here to help! Get in touch with us for any questions or support.
          </Typography>
        </Box>

      <Grid container spacing={4}>
        {/* Contact Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Send us a Message
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Your Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                multiline
                rows={4}
                margin="normal"
                variant="outlined"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                startIcon={<Send />}
                sx={{ mt: 2, py: 1.5 }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Get in Touch
            </Typography>
            <Grid container spacing={3}>
              {contactInfo.map((info, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        {info.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {info.title}
                      </Typography>
                      {info.details.map((detail, idx) => (
                        <Typography 
                          key={idx} 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontWeight: detail === info.primary ? 'bold' : 'normal',
                            color: detail === info.primary ? 'primary.main' : 'text.secondary'
                          }}
                        >
                          {detail}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Departments */}
          <Typography variant="h5" gutterBottom>
            Departments
          </Typography>
          <Grid container spacing={3}>
            {departments.map((dept, index) => (
              <Grid item xs={12} key={index}>
                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {dept.icon}
                    <Typography variant="h6" sx={{ ml: 2 }}>
                      {dept.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Email: {dept.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phone: {dept.phone}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Business Hours */}
      <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Business Hours
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Monday - Friday:</strong> 9:00 AM - 8:00 PM
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Saturday - Sunday:</strong> 10:00 AM - 6:00 PM
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
};

export default Contact;
