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
  
  const { getUserRating, updateUserRating } = useRating();
  
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

  // STEP 1: Detect when user clicks a star rating on a product
  const handleStarClick = async (starValue, event) => {
    if (readOnly || loading) return;

    // Prevent event from bubbling up to parent elements
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    console.log('=== STAR RATING CLICK DETECTED ===');
    console.log('STEP 1: Product ID:', productId);
    console.log('STEP 1: User ID:', localStorage.getItem('userId'));
    console.log('STEP 1: Selected Rating Value:', starValue);
    console.log('STEP 1: Current Rating:', rating);

    try {
      setLoading(true);
      
      // STEP 2: Capture productId, userId, and selected rating value
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('STEP 2: User not logged in');
        alert('Please login to rate products');
        return;
      }

      console.log('STEP 2: Captured data - userId:', userId, 'productId:', productId, 'rating:', starValue);

      // STEP 3: Send POST request from frontend to backend API with rating data
      console.log('STEP 3: Sending POST request to backend...');
      console.log('STEP 3: API Endpoint:', 'http://localhost:8081/api/recommendations/rate');
      console.log('STEP 3: Request data:', { userId: parseInt(userId), productId, rating: starValue });

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

      console.log('STEP 3: Response status:', response.status);
      console.log('STEP 3: Response ok:', response.ok);

      // STEP 4: Ensure API endpoint URL matches backend controller mapping
      if (response.ok) {
        const result = await response.json();
        console.log('STEP 4: API response received:', result);
        
        // STEP 5: Receive rating data in backend using @RequestBody in controller
        // This is handled in backend RecommendationController.rateProduct()
        console.log('STEP 5: Backend should receive data via @RequestBody');
        
        // STEP 6: Validate that productId, userId, and rating are not null
        if (result && result.success) {
          console.log('STEP 6: Backend validation passed - no null values');
          
          // STEP 7: Check if a rating already exists for same user and product
          if (result.action === 'updated') {
            console.log('STEP 7: Existing rating found and updated');
          } else if (result.action === 'created') {
            console.log('STEP 7: New rating created');
          }
          
          // STEP 8: Update existing rating value OR create new rating record
          // This is handled in backend with ratingRepo.save()
          console.log('STEP 8: Backend saved rating using repository.save()');
          
          // Update local state and context
          setRating(starValue);
          updateUserRating(productId, starValue);
          
          console.log('STEP 8: Frontend state updated - Rating:', starValue);
          
          if (onRatingChange) {
            onRatingChange(starValue);
          }
          
          // Show success message
          setSuccessMessage(`✅ Star rating ${starValue} stars submitted successfully!`);
          setShowSuccess(true);
          
          console.log('=== STAR RATING SUCCESS ===');
          console.log('✅ All steps completed successfully');
        } else {
          console.log('STEP 6: Backend validation failed - null values detected');
          console.log('Error:', result.message);
        }
      } else {
        console.log('STEP 4: API request failed');
        console.log('Status:', response.status);
        alert('Failed to update star rating. Please try again.');
      }
    } catch (error) {
      console.error('=== STAR RATING ERROR ===');
      console.error('Error details:', error);
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
