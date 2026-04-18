import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Divider, TextField } from '@mui/material';
import { useRating } from '../contexts/RatingContext';
import ratingService from '../services/ratingService';

const DebugPanel = () => {
  const { userRatings, loading, getUserRating, updateUserRating, forceRefresh, clearRatings } = useRating();
  const [testProductId, setTestProductId] = useState('1');

  const handleCheckRating = () => {
    const rating = getUserRating(parseInt(testProductId));
    console.log(`Product ${testProductId} rating:`, rating);
    alert(`Product ${testProductId} rating: ${rating || 'Not rated'}`);
  };

  const handleShowAllRatings = () => {
    console.log('All user ratings:', userRatings);
    alert(`Total ratings: ${Object.keys(userRatings).length}\n${JSON.stringify(userRatings, null, 2)}`);
  };

  const handleCheckUserId = () => {
    const userId = localStorage.getItem('userId');
    console.log('Current userId:', userId);
    alert(`Current userId: ${userId || 'Not logged in'}`);
  };

  const handleDirectApiTest = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please login first');
      return;
    }

    try {
      console.log('=== DIRECT API TEST ===');
      const response = await ratingService.getUserRatings(userId);
      console.log('Direct API test successful:', response);
      alert(`Direct API test successful! Found ${response.data?.length || 0} ratings`);
    } catch (error) {
      console.error('Direct API test failed:', error);
      alert(`Direct API test failed: ${error.message}`);
    }
  };

  const handleForceReload = async () => {
    console.log('=== FORCE RELOAD RATINGS ===');
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please login first');
      return;
    }

    try {
      // Clear current ratings
      clearRatings();
      
      // Force reload from database
      console.log('Force reloading ratings for user:', userId);
      await ratingService.getUserRatings(userId);
      
      // Reload the context
      window.location.reload();
    } catch (error) {
      console.error('Force reload failed:', error);
      alert(`Force reload failed: ${error.message}`);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.100' }}>
      <Typography variant="h6" gutterBottom>
        Debug Panel - Rating System
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Loading: {loading ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Ratings: {Object.keys(userRatings).length}
        </Typography>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleCheckUserId}
        >
          Check User ID
        </Button>
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleDirectApiTest}
          color="primary"
        >
          Test API Directly
        </Button>
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleForceReload}
          color="warning"
        >
          Force Reload
        </Button>
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleShowAllRatings}
        >
          Show All Ratings
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <input
            type="number"
            value={testProductId}
            onChange={(e) => setTestProductId(e.target.value)}
            placeholder="Product ID"
            style={{ width: '80px', padding: '4px' }}
          />
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleCheckRating}
          >
            Check Rating
          </Button>
        </Box>
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={forceRefresh}
          color="primary"
        >
          Force Refresh
        </Button>
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={clearRatings}
          color="error"
        >
          Clear Ratings
        </Button>
      </Box>
    </Paper>
  );
};

export default DebugPanel;
