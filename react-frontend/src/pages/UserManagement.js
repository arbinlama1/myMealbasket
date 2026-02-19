import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import UserTable from '../components/User/UserTable';
import ApiStatusChecker from '../components/ApiStatusChecker';

const UserManagement = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
          User Management Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage users, create new accounts, and maintain user information
        </Typography>
      </Box>
      
      <ApiStatusChecker />
      
      <Paper sx={{ p: 3, boxShadow: 3 }}>
        <UserTable />
      </Paper>
    </Container>
  );
};

export default UserManagement;
