import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';

const ApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const API_URL = 'http://localhost:8081/api/user';

  // Test GET all users
  const testGetAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/all`);
      setResult(JSON.stringify(response.data, null, 2));
      showSnackbar('GET All Users: Success', 'success');
    } catch (error) {
      setResult(JSON.stringify(error.response?.data || error.message, null, 2));
      showSnackbar('GET All Users: Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test POST create user
  const testCreateUser = async () => {
    setLoading(true);
    try {
      const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: 'Test Address'
      };
      
      const response = await axios.post(`${API_URL}/create`, testUser);
      setResult(JSON.stringify(response.data, null, 2));
      showSnackbar('POST Create User: Success', 'success');
    } catch (error) {
      setResult(JSON.stringify(error.response?.data || error.message, null, 2));
      showSnackbar('POST Create User: Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test GET user by ID
  const testGetUserById = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/1`);
      setResult(JSON.stringify(response.data, null, 2));
      showSnackbar('GET User by ID: Success', 'success');
    } catch (error) {
      setResult(JSON.stringify(error.response?.data || error.message, null, 2));
      showSnackbar('GET User by ID: Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User API Test
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Test the connection between frontend and backend User API endpoints
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={testGetAllUsers}
          disabled={loading}
          sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
        >
          {loading ? 'Testing...' : 'GET All Users'}
        </Button>
        
        <Button
          variant="contained"
          onClick={testCreateUser}
          disabled={loading}
          color="secondary"
        >
          {loading ? 'Testing...' : 'POST Create User'}
        </Button>
        
        <Button
          variant="contained"
          onClick={testGetUserById}
          disabled={loading}
          color="info"
        >
          {loading ? 'Testing...' : 'GET User by ID (1)'}
        </Button>
      </Box>

      <Paper sx={{ p: 2, minHeight: 200, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          API Response:
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={10}
          value={result}
          InputProps={{
            readOnly: true,
            style: { fontFamily: 'monospace', fontSize: '12px' }
          }}
          variant="outlined"
        />
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Endpoints Being Tested:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li><strong>GET</strong> {API_URL}/all - Get all users</li>
          <li><strong>POST</strong> {API_URL}/create - Create new user</li>
          <li><strong>GET</strong> {API_URL}/1 - Get user by ID</li>
          <li><strong>PUT</strong> {API_URL}/update/1 - Update user</li>
          <li><strong>DELETE</strong> {API_URL}/delete/1 - Delete user</li>
        </Box>
      </Box>

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
  );
};

export default ApiTest;
