import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useRating } from '../contexts/RatingContext';

const FavoriteButton = ({ 
  productId, 
  size = 'medium',
  onFavoriteChange,
  showLabel = true,
  showAverageRating = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const { getUserRating, updateUserRating } = useRating();
  
  // Check if product is favorited (user has rated it)
  const userRating = getUserRating(productId);
  const isFavorited = userRating !== null && userRating > 0;

  // Fetch product rating statistics
  useEffect(() => {
    const fetchProductRating = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const url = userId 
          ? `http://localhost:8081/api/recommendations/product/${productId}/rating?userId=${userId}`
          : `http://localhost:8081/api/recommendations/product/${productId}/rating`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setAverageRating(data.averageRating || 0);
          setRatingCount(data.ratingCount || 0);
        }
      } catch (error) {
        console.error('Error fetching product rating:', error);
      }
    };

    if (showAverageRating) {
      fetchProductRating();
    }
  }, [productId, showAverageRating]);

  const getIconSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 48;
      default: return 32;
    }
  };

  const handleFavoriteClick = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (loading) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.log('User not logged in, showing login prompt');
      alert('Please login to favorite products');
      return;
    }

    try {
      setLoading(true);
      console.log('=== FAVORITE BUTTON CLICK ===');
      console.log('User ID:', userId);
      console.log('Product ID:', productId);
      console.log('Current favorite status:', isFavorited);
      console.log('New rating will be:', isFavorited ? 0 : 5);
      
      // Toggle favorite status
      const newRating = isFavorited ? 0 : 5; // 0 = not favorited, 5 = favorited
      
      // Call rating service to update
      const response = await fetch('http://localhost:8081/api/recommendations/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          productId: productId,
          rating: newRating
        })
      });

      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', [...response.headers.entries()]);

      if (response.ok) {
        const result = await response.json();
        console.log('API Response Data:', result);
        
        // Update local state immediately
        updateUserRating(productId, newRating);
        
        // Update average rating if showing
        if (showAverageRating && result.averageRating !== undefined) {
          setAverageRating(result.averageRating);
          setRatingCount(result.ratingCount);
        }
        
        if (onFavoriteChange) {
          onFavoriteChange(!isFavorited);
        }
        
        console.log('✅ Favorite updated successfully');
        console.log('Action:', result.action);
        console.log('Message:', result.message);
        
      } else {
        console.error('❌ Failed to update favorite status');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        
        // Try to get error details
        try {
          const errorData = await response.json();
          console.error('Error Data:', errorData);
          alert(`Failed to update favorite: ${errorData.message || 'Unknown error'}`);
        } catch (e) {
          console.error('Could not parse error response:', e);
          alert(`Failed to update favorite: Server error (${response.status})`);
        }
      }
    } catch (error) {
      console.error('❌ Network error updating favorite:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Show user-friendly error message
      if (error.name === 'TypeError') {
        alert('Network error: Please check your internet connection and try again.');
      } else if (error.name === 'AbortError') {
        alert('Request timed out: Please try again.');
      } else {
        alert(`Failed to update favorite: ${error.message}. Please try again.`);
      }
    } finally {
      setLoading(false);
      console.log('=== FAVORITE BUTTON CLICK END ===');
    }
  };

  const FavoriteIcon = isFavorited ? Favorite : FavoriteBorder;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        opacity: loading ? 0.6 : 1
      }}
      onClick={handleFavoriteClick}
    >
      <Tooltip title={isFavorited ? "Remove from favorites" : "Add to favorites"}>
        <IconButton
          size={size}
          sx={{
            color: isFavorited ? 'error.main' : 'action.disabled',
            transition: 'color 0.2s ease-in-out',
            '&:hover': {
              color: isFavorited ? 'error.dark' : 'action.active'
            }
          }}
          disabled={loading}
        >
          <FavoriteIcon sx={{ fontSize: getIconSize() }} />
        </IconButton>
      </Tooltip>
      
      {showLabel && (
        <Typography variant="body2" sx={{ minWidth: '30px' }}>
          {isFavorited ? '(1)' : '(0)'}
        </Typography>
      )}
      
      {showAverageRating && ratingCount > 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {averageRating.toFixed(1)} ({ratingCount})
        </Typography>
      )}
    </Box>
  );
};

export default FavoriteButton;
