import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Button,
} from '@mui/material';
import {
  Restaurant,
  LocalShipping,
  People,
  Nature,
  Star,
  LocationOn,
  Email,
  Phone,
  ArrowBack,
  Home,
} from '@mui/icons-material';

const AboutUs = () => {
  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const team = [
    {
      name: 'MealBasket Team',
      role: 'Smart Meal Planning',
      avatar: '🍽️',
      description: 'Dedicated to making healthy eating convenient and affordable'
    }
  ];

  const values = [
    {
      icon: <Restaurant sx={{ fontSize: 40, color: '#2E7D32' }} />,
      title: 'Quality Food',
      description: 'Partnering with best restaurants and vendors for fresh, quality meals'
    },
    {
      icon: <LocalShipping sx={{ fontSize: 40, color: '#FF6B35' }} />,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep'
    },
    {
      icon: <People sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Customer First',
      description: 'Your satisfaction is our top priority'
    },
    {
      icon: <Nature sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: 'Sustainable',
      description: 'Eco-friendly packaging and sustainable practices'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Happy Customers' },
    { number: '50+', label: 'Restaurant Partners' },
    { number: '10000+', label: 'Meals Delivered' },
    { number: '4.8', label: 'Average Rating' }
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
            About Us
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
          <Typography variant="h2" component="h1" gutterBottom color="primary">
            About MealBasket
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Your Smart Meal Planning and Food Delivery Partner
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            We're revolutionizing the way people plan and enjoy their meals. With our AI-powered 
            meal planning and extensive restaurant network, we make healthy eating convenient, 
            affordable, and delicious.
          </Typography>
        </Box>

      {/* Stats */}
      <Paper sx={{ p: 4, mb: 6, backgroundColor: '#f8f9fa' }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box textAlign="center">
                <Typography variant="h3" component="div" color="primary" gutterBottom>
                  {stat.number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Values */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          Our Values
        </Typography>
        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {value.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Team */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          Our Team
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {team.map((member, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <Avatar
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2, 
                    fontSize: 40,
                    backgroundColor: '#2E7D32'
                  }}
                >
                  {member.avatar}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {member.name}
                </Typography>
                <Typography variant="body2" color="primary" gutterBottom>
                  {member.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Contact Info */}
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Get in Touch
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn color="primary" />
            <Typography>Kathmandu, Nepal</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email color="primary" />
            <Typography>info@mealtbasket.com</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Phone color="primary" />
            <Typography>+977-9761611421</Typography>
          </Box>
        </Box>
      </Paper>
      </Container>
    </Box>
  );
};

export default AboutUs;
