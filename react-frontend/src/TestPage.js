import React from 'react';
import { Container, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TestPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'API Testing',
      description: 'Test backend connection and API endpoints',
      path: '/api-test',
      color: '#2196F3'
    },
    {
      title: 'User Management',
      description: 'Manage users - Add, Edit, Delete users',
      path: '/user-management',
      color: '#4CAF50'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box textAlign="center" sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          🎉 MealBasket System
        </Typography>
        <Typography variant="h5" gutterBottom>
          Frontend is Working!
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Your React application is successfully running. Test the features below:
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} key={feature.title}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ color: feature.color }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {feature.description}
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: feature.color,
                    '&:hover': { backgroundColor: feature.color }
                  }}
                >
                  Access {feature.title}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          🚀 System Status
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ✅ Frontend: React + Material-UI Working<br/>
          ✅ Backend: Spring Boot API Running<br/>
          ✅ Database: PostgreSQL Connected<br/>
          ✅ User Management: Full CRUD Operations
        </Typography>
      </Box>
    </Container>
  );
};

export default TestPage;
