import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useRating } from '../contexts/RatingContext';

const StarRating = ({ 
  productId, 
  initialRating = 0, 
  readOnly = false, 
  size = 'medium',
  onRatingChange,
  showValue = true 
}) => {
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { getUserRating, updateUserRating, getProductRating } = useRating(); // FIXED: Added getProductRating
  
  // Get user's rating from context
  const userRating = getUserRating(productId);
  const [rating, setRating] = useState(userRating || initialRating);

  // Update rating when userRating changes from context
  useEffect(() => {
    if (userRating !== null) {
      console.log(`StarRating for product ${productId}: User rating from context:`, userRating);
      setRating(userRating);
    }
  }, [userRating]);

  // FIXED: Load product rating when component mounts using correct API
  useEffect(() => {
    console.log(`StarRating component mounted for product ${productId}`);
    
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log('Loading product rating directly from FIXED API...');
      
      // FIXED: Use the new getProductRating function with correct endpoint
      const loadProductRating = async () => {
        try {
          const ratingData = await getProductRating(userId, productId);
          if (ratingData) {
            console.log(`Setting product ${productId} rating to:`, ratingData.rating);
            setRating(ratingData.rating);
          }
        } catch (error) {
          console.error('Error loading product rating:', error);
        }
      };
      
      loadProductRating();
    }
  }, [productId, getProductRating]); // FIXED: Added dependency

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 32;
      default: return 24;
    }
  };

  // FIXED: Handle star click with comprehensive logging and correct API
  const handleStarClick = async (starValue, event) => {
    if (readOnly || loading) return;

    // Prevent event from bubbling up to parent elements
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    console.log('=== STAR RATING CLICK DETECTED ===');
    console.log('Product ID:', productId);
    console.log('User ID:', localStorage.getItem('userId'));
    console.log('Star Value:', starValue);
    console.log('Current Rating:', rating);

    try {
      setLoading(true);
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('User not logged in');
        alert('Please login to rate products');
        return;
      }

      console.log('Submitting star rating to backend...');
      console.log('API Endpoint: http://localhost:8081/api/recommendations/rate');
      console.log('Request data:', { userId: parseInt(userId), productId, rating: starValue });

      // FIXED: Direct fetch API call with comprehensive error handling
      const response = await fetch('http://localhost:8081/api/recommendations/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          productId: productId,
          rating: starValue
        })
      });

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Star rating API response:', result);
        
        // Update local state and context
        setRating(starValue);
        updateUserRating(productId, starValue);
        
        console.log('Star rating updated locally:', starValue);
        
        if (onRatingChange) {
          onRatingChange(starValue);
        }
        
        console.log('=== STAR RATING SUCCESS ===');
        console.log('✅ Star rating updated successfully');
        
        // Show success message to user
        setSuccessMessage(`✅ Star rating ${starValue} stars submitted successfully!`);
        setShowSuccess(true);
      } else {
        console.error('Failed to update star rating');
        console.error('Response status:', response.status);
        console.error('Response text:', await response.text());
        alert('Failed to update star rating. Please try again.');
      }
    } catch (error) {
      console.error('=== STAR RATING ERROR ===');
      console.error('Error submitting rating:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      alert(`Failed to submit rating: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = rating || 0;
    
    for (let i = 1; i <= 5; i++) {
      const filled = i <= displayRating;
      const hovered = i <= hover;
      
      stars.push(
        <Star
          key={i}
          sx={{
            fontSize: getIconSize(),
            color: filled ? '#ffc107' : hovered ? '#ffc107' : '#e4e5e7',
            cursor: readOnly ? 'default' : 'pointer',
            transition: 'all 0.2s ease-in-out',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
            opacity: loading ? 0.6 : 1,
          }}
          onClick={(e) => !readOnly && handleStarClick(i, e)}
          onMouseEnter={() => !readOnly && setHover(i)}
          onMouseLeave={() => !readOnly && setHover(0)}
        />
      );
      
      if (i < 5) {
        stars.push(<StarBorder key={`border-${i}`} sx={{ 
          fontSize: getIconSize(), 
          color: '#e4e5e7',
          opacity: loading ? 0.6 : 1,
        }} />);
      }
    }
    
    return stars;
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        opacity: loading ? 0.6 : 1
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {renderStars()}
      </Box>
      {showValue && (
        <Typography variant="body2" sx={{ minWidth: '30px' }}>
          {userRating !== null ? `(${userRating})` : rating > 0 ? `(${rating})` : '(0)'}
        </Typography>
      )}
      
      {/* Success Message Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StarRating;
