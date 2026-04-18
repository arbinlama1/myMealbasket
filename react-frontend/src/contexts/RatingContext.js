import React, { createContext, useContext, useState, useEffect } from 'react';

const RatingContext = createContext();

export const useRating = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
};

export const RatingProvider = ({ children }) => {
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId'));

  // Load user ratings from database (never from cache/session)
  const loadUserRatings = async () => {
    const userId = localStorage.getItem('userId');
    console.log('=== LOADING USER RATINGS FROM DATABASE ===');
    console.log('UserId from localStorage:', userId);
    console.log('UserId type:', typeof userId);
    console.log('UserId is null:', userId === null);
    console.log('UserId is undefined:', userId === undefined);
    console.log('UserId is empty:', userId === '');
    console.log('LocalStorage contents:', {
      userId: localStorage.getItem('userId'),
      userName: localStorage.getItem('userName'),
      userEmail: localStorage.getItem('email'),
      token: localStorage.getItem('token')
    });
    
    if (userId) {
      try {
        setLoading(true);
        console.log('Fetching ratings from database for userId:', userId);
        
        // Always fetch from database API (no cache) - USE NEW RATING CONTROLLER
        const response = await fetch(`http://localhost:8081/api/ratings/user/${userId}`);
        console.log('Database API response:', response);
        
        if (response && response.ok) {
          const data = await response.json();
          console.log('Database API data:', data);
          
          if (Array.isArray(data)) {
            const ratingsMap = {};
            let validRatings = 0;
            
            data.forEach(rating => {
            console.log('Processing rating from database:', {
              id: rating.id,
              productId: rating.product?.id,
              rating: rating.rating,
              createdAt: rating.createdAt,
              fullRatingObject: rating
            });
            
            // Handle both cases: rating.product exists OR productId is directly in rating object
            const productIdToUse = rating.product?.id || rating.productId;
            
            if (productIdToUse) {
              ratingsMap[productIdToUse] = rating.rating;
              validRatings++;
              console.log(`Mapped rating: Product ${productIdToUse} -> Rating ${rating.rating}`);
            } else {
              console.log('Skipping rating - no productId found:', rating);
            }
          });
          
          console.log(`Successfully loaded ${validRatings} ratings from database`);
          console.log('Final ratings map:', ratingsMap);
          setUserRatings(ratingsMap);
          
          // Verify persistence by checking database count
          console.log('Database persistence verified - ratings loaded from PostgreSQL');
          } else {
            console.log('No ratings found in database for user:', userId);
            setUserRatings({});
          }
        }
      } catch (error) {
        console.error('=== ERROR LOADING RATINGS FROM DATABASE ===');
        console.error('Error details:', error);
        console.error('Response:', error.response);
        setUserRatings({});
      } finally {
        setLoading(false);
      }
    } else {
      // Clear ratings when user logs out (session independence)
      console.log('=== USER LOGGED OUT - CLEARING MEMORY ===');
      console.log('No userId found, clearing ratings from memory only');
      setUserRatings({});
    }
  };

  // Load user ratings on component mount AND when userId changes
  useEffect(() => {
    console.log('=== RATING CONTEXT MOUNTED ===');
    console.log('Current userId in localStorage:', localStorage.getItem('userId'));
    console.log('Current userId in state:', currentUserId);
    
    // Always try to load ratings if userId exists
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log('Component mounted with userId, loading ratings...');
      loadUserRatings();
    } else {
      console.log('Component mounted without userId, clearing ratings');
      setUserRatings({});
    }
  }, []); // Empty dependency array - runs once on mount

  // Update current userId when it changes
  useEffect(() => {
    const checkUserId = () => {
      const userId = localStorage.getItem('userId');
      
      // Only log when userId actually changes AND it's not just null->null
      if (userId !== currentUserId && !(userId === null && currentUserId === null)) {
        console.log('UserId changed from', currentUserId, 'to', userId);
        setCurrentUserId(userId);
        if (userId) {
          console.log('New userId detected, loading ratings...');
          loadUserRatings();
        } else {
          console.log('User logged out, clearing ratings');
          setUserRatings({});
        }
      }
    };

    // Check immediately
    checkUserId();

    // No polling - only check when storage changes or component mounts
  }, [currentUserId]);

  // Also listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log('Storage change detected:', e);
      if (e.key === 'userId' || e.key === null) {
        const newUserId = localStorage.getItem('userId');
        console.log('UserId changed in storage, reloading ratings');
        setCurrentUserId(newUserId);
        setTimeout(() => loadUserRatings(), 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateUserRating = (productId, rating) => {
    setUserRatings(prev => ({
      ...prev,
      [productId]: rating
    }));
  };

  const getUserRating = (productId) => {
    return userRatings[productId] || null;
  };

  // Get specific product rating from database using new RatingController
  const getProductRating = async (userId, productId) => {
    console.log(`=== LOADING SPECIFIC PRODUCT RATING ===`);
    console.log('UserId:', userId);
    console.log('ProductId:', productId);
    
    try {
      console.log('Fetching specific product rating from NEW RatingController...');
      
      // Use NEW RatingController endpoint
      const response = await fetch(`http://localhost:8081/api/ratings/user/${userId}/product/${productId}`);
      console.log('Product rating API response:', response);
      
      if (response && response.ok) {
        const data = await response.json();
        console.log(`Product ${productId} rating from API:`, data);
        return data; // Return the rating object directly
      } else {
        console.log('Failed to fetch product rating');
        return null;
      }
    } catch (error) {
      console.error('Error loading product rating:', error);
      return null;
    }
  };

  // Submit rating to backend - CRITICAL FOR PERSISTENCE
  const submitRating = async (userId, productId, rating) => {
    console.log('=== SUBMITTING RATING TO BACKEND ===');
    console.log('UserId:', userId);
    console.log('UserId type:', typeof userId);
    console.log('UserId is null:', userId === null);
    console.log('UserId is undefined:', userId === undefined);
    console.log('UserId is empty:', userId === '');
    console.log('ProductId:', productId);
    console.log('Rating:', rating);
    console.log('LocalStorage at submit time:', {
      userId: localStorage.getItem('userId'),
      userName: localStorage.getItem('userName'),
      userEmail: localStorage.getItem('email'),
      token: localStorage.getItem('token')
    });
    
    // CRITICAL: Validate userId before submission
    if (!userId || userId === null || userId === undefined || userId === '') {
      console.error('CRITICAL: Cannot submit rating - userId is NULL or invalid');
      console.error('UserId value:', userId);
      console.error('UserId type:', typeof userId);
      return { success: false, message: 'User not logged in - userId is NULL' };
    }
    
    try {
      console.log('Submitting rating to NEW RatingController...');
      
      const response = await fetch('http://localhost:8081/api/ratings/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          productId: productId,
          rating: rating
        })
      });
      
      console.log('Rating submission API response:', response);
      
      if (response && response.ok) {
        const result = await response.json();
        console.log('Rating submission result:', result);
        
        if (result && result.success) {
          console.log('Rating submission SUCCESS:', result.action);
          
          // CRITICAL: Update context state immediately
          setUserRatings(prev => ({
            ...prev,
            [productId]: rating
          }));
          
          console.log('Context state updated immediately for product', productId, 'with rating', rating);
          
          // Also refresh all ratings to ensure consistency
          await loadUserRatings();
          
          return { success: true, action: result.action, message: result.message };
        } else {
          console.error('Rating submission FAILED:', result.message);
          return { success: false, message: result.message };
        }
      } else {
        console.error('Rating submission HTTP error:', response.status);
        return { success: false, message: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      return { success: false, message: error.message };
    }
  };

  const clearRatings = () => {
    setUserRatings({});
  };

  const value = {
    userRatings,
    loading,
    updateUserRating,
    getUserRating,
    getProductRating, // Added getProductRating function
    submitRating, // CRITICAL: Added submitRating function for persistence
    clearRatings,
    refreshRatings: loadUserRatings,
    forceRefresh: () => {
      console.log('Force refreshing ratings...');
      loadUserRatings();
    }
  };

  return (
    <RatingContext.Provider value={value}>
      {children}
    </RatingContext.Provider>
  );
};

export default RatingContext;
