import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Snackbar, Alert, Button } from '@mui/material';
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
  // DEBUG: Log component mount
  console.log('=== STAR RATING COMPONENT MOUNTED ===');
  console.log('ProductId:', productId);
  console.log('InitialRating:', initialRating);
  console.log('ReadOnly:', readOnly);
  console.log('ShowValue:', showValue);
  
  // Test console output
  console.log('=== TESTING CONSOLE OUTPUT ===');
  console.log('This should appear in console when component mounts');
  
  // Load product rating if in read-only mode
  if (readOnly && productId) {
    loadProductRating();
  }

  useEffect(() => {
    console.log('=== STAR RATING COMPONENT MOUNTED ===');
    console.log('ProductId:', productId);
    console.log('InitialRating:', initialRating);
    console.log('ReadOnly:', readOnly);
    console.log('ShowValue:', showValue);
    
    // Test console output
    console.log('=== TESTING CONSOLE OUTPUT ===');
    console.log('This should appear in console when component mounts');
    
    // Load product rating if in read-only mode
    if (readOnly && productId) {
      loadProductRating();
    }
  }, [productId, readOnly, loadProductRating]);

  // Load product rating from backend
  const loadProductRating = async () => {
    try {
      console.log('=== LOADING PRODUCT RATING ===');
      console.log('ProductId:', productId);
      
      const response = await fetch(`http://localhost:8081/api/ratings/product/${productId}/stats`);
      if (response.ok) {
        const data = await response.json();
        console.log('Product rating data:', data);
        
        // Fix: Use the correct rating field from backend
        const actualRating = data.rating || 0;
        const averageRating = data.averageRating || 0;
        const ratingCount = data.ratingCount || 0;
        
        console.log('Actual Rating:', actualRating);
        console.log('Average Rating:', averageRating);
        console.log('Rating Count:', ratingCount);
        
        // Set rating to the actual rating value (1-5)
        setRating(actualRating);
        
      } else {
        console.error('Failed to load product rating');
      }
    } catch (error) {
      console.error('Error loading product rating:', error);
    }
  };

  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingRating, setPendingRating] = useState(null);
  
  const { getUserRating, updateUserRating, submitRating } = useRating();
  
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

  // Load product rating when component mounts
  useEffect(() => {
    console.log(`StarRating component mounted for product ${productId}`);
    
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log('Loading product rating directly from API...');
      
      // Direct API call to get this product's rating
      const loadProductRating = async () => {
        try {
          const response = await fetch(`http://localhost:8081/api/recommendations/user/${userId}/product/${productId}/rating`);
          if (response && response.ok) {
            const data = await response.json();
            console.log(`Product ${productId} rating from API:`, data);
            if (data && data.rating !== undefined) {
              console.log(`Setting product ${productId} rating to:`, data.rating);
              setRating(data.rating);
            }
          }
        } catch (error) {
          console.error('Error loading product rating:', error);
        }
      };
      
      loadProductRating();
    }
  }, [productId]);

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 32;
      default: return 24;
    }
  };

  const handleStarClick = async (starValue, event) => {
    console.log('=== STAR CLICKED ===');
    console.log('Star Value:', starValue);
    console.log('Product ID:', productId);
    console.log('Current Rating:', rating);

    // Prevent event from bubbling up to parent elements
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    // Set pending rating, don't submit yet
    setPendingRating(starValue);
    setRating(starValue);
    
    console.log('Pending rating set:', starValue);
    console.log('Click submit button to save rating');
  };

  const renderStars = () => {
    const stars = [];
    const iconSize = getIconSize();
    const displayRating = userRating !== null ? userRating : rating;

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hover || displayRating);
      const StarIcon = isFilled ? Star : StarBorder;
      
      stars.push(
        <StarIcon
          key={i}
          sx={{
            fontSize: iconSize,
            color: isFilled ? '#ffc107' : '#e0e0e0',
            cursor: readOnly ? 'default' : 'pointer',
            transition: 'color 0.2s ease-in-out',
            '&:hover': {
              color: readOnly ? (isFilled ? '#ffc107' : '#e0e0e0') : '#ffb300'
            }
          }}
          onClick={(event) => handleStarClick(i, event)}
          onMouseEnter={() => !readOnly && setHover(i)}
          onMouseLeave={() => !readOnly && setHover(0)}
        />
      );
    }
    return stars;
  };

  // Handle submit button click
  const handleSubmitRating = async () => {
    if (!pendingRating) {
      alert('Please select a rating first');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please login to rate products');
      return;
    }

    console.log('=== SUBMITTING RATING ===');
    console.log('UserId:', userId);
    console.log('ProductId:', productId);
    console.log('Rating:', pendingRating);

    try {
      setLoading(true);
      
      const result = await submitRating(userId, productId, pendingRating);
      
      if (result && result.success) {
        console.log('Rating submission SUCCESS:', result.action);
        
        // Clear pending rating after successful submission
        setPendingRating(null);
        
        if (onRatingChange) {
          onRatingChange(pendingRating);
        }
        
        console.log('=== RATING SUBMITTED SUCCESSFULLY ===');
        
        // Show success message
        setSuccessMessage(`Rating ${pendingRating} stars submitted successfully! (${result.action})`);
        setShowSuccess(true);
      } else {
        console.error('Rating submission FAILED:', result ? result.message : 'Unknown error');
        alert('Failed to submit rating: ' + (result ? result.message : 'Unknown error'));
      }
    } catch (error) {
      console.error('=== RATING SUBMISSION ERROR ===');
      console.error('Error:', error);
      alert(`Failed to submit rating: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {renderStars()}
        {/* Rating Number Display */}
        {showValue && (
          <Typography variant="body2" sx={{ minWidth: '30px', fontWeight: 'bold', color: '#1976d2' }}>
            {userRating !== null ? `(${userRating})` : rating > 0 ? `(${rating})` : '(0)'}
          </Typography>
        )}
        {showValue && readOnly && (
          <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold', color: '#1976d2' }}>
            {rating} / 5
          </Typography>
        )}
        {/* Submit Button */}
        {!readOnly && pendingRating && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleSubmitRating}
            sx={{ mt: 1 }}
          >
            Submit {pendingRating} Stars
          </Button>
        )}
        
        {/* Success Message Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          disableWindowBlur={false}
          sx={{
            '& .MuiSnackbar-root': {
              '&:focus-within': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px',
              }
            }
          }}
        >
        <Alert 
          severity="success" 
          sx={{ width: '100%' }}
          role="alert"
          aria-live="polite"
          tabIndex={0}
        >
          {successMessage}
        </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default StarRating;
