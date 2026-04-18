import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useRating } from '../contexts/RatingContext';
import { useTheme } from '@mui/material/styles';

const FavoriteHeart = ({ 
  productId, 
  size = 'medium',
  onFavoriteChange,
  showLabel = true,
  showAnimation = true,
  style = {}
}) => {
  const theme = useTheme();
  const { getUserRating, updateUserRating } = useRating();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Check if product is favorited (user has rated it)
  const userRating = getUserRating(productId);
  const isFavorited = userRating !== null && userRating > 0;
  
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
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please login to favorite products');
      return;
    }

    // Add animation effect
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    try {
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

      if (response.ok) {
        const result = await response.json();
        updateUserRating(productId, newRating);
        
        if (onFavoriteChange) {
          onFavoriteChange(!isFavorited);
        }
        
        console.log('✅ Favorite updated successfully');
      } else {
        console.error('Failed to update favorite status');
        alert('Failed to update favorite. Please try again.');
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      alert('Failed to update favorite. Please try again.');
    }
  };

  const FavoriteIcon = isFavorited ? Favorite : FavoriteBorder;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        opacity: isAnimating ? 0.6 : 1,
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: isAnimating ? 'scale(1.1)' : 'scale(1.05)',
          transition: 'transform 0.2s ease-in-out'
        },
        ...style
      }}
      onClick={handleFavoriteClick}
    >
      <Tooltip 
        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        placement="top"
      >
        <IconButton
          size={size}
          sx={{
            color: isFavorited ? 'error.main' : 'action.disabled',
            transition: 'color 0.3s ease-in-out',
            transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
            '&:hover': {
              color: isFavorited ? 'error.dark' : 'action.active',
              transform: 'scale(1.1)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            }
          }}
        >
          <FavoriteIcon 
            sx={{ 
              fontSize: getIconSize(),
              filter: isFavorited 
                ? 'drop-shadow(0px 2px 4px rgba(244, 67, 54, 0.2))' 
                : 'none',
              animation: showAnimation ? 'heartbeat 1.5s ease-in-out infinite' : 'none'
            }}
          />
        </IconButton>
      </Tooltip>
      
      {showLabel && (
        <Typography 
          variant="body2" 
          sx={{ 
            minWidth: '30px',
            color: isFavorited ? 'error.main' : 'text.secondary',
            fontWeight: isFavorited ? 'bold' : 'normal'
          }}
        >
          {isFavorited ? 'Favorited' : 'Not Favorited'}
        </Typography>
      )}
    </Box>
  );
};

export default FavoriteHeart;
