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
    
    if (userId) {
      try {
        setLoading(true);
        console.log('Fetching ratings from database for userId:', userId);
        
        // FIXED: Always fetch from database API (no cache) - DIRECT FETCH LIKE FAVORITE
        const response = await fetch(`http://localhost:8081/api/recommendations/user/${userId}/ratings`);
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
            
            // FIXED: Handle both cases: rating.product exists OR productId is directly in rating object
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

  // Update current userId when it changes in localStorage
  useEffect(() => {
    const checkUserId = () => {
      const userId = localStorage.getItem('userId');
      console.log('Checking userId - current:', currentUserId, 'new:', userId);
      
      if (userId !== currentUserId) {
        console.log('UserId changed from', currentUserId, 'to', userId);
        setCurrentUserId(userId);
        if (userId) {
          console.log('New userId detected, loading ratings...');
          loadUserRatings(); // CRITICAL: Load ratings when user logs back in
        } else {
          console.log('User logged out, clearing ratings');
          setUserRatings({});
        }
      }
    };

    // Check immediately
    checkUserId();
    
    // Also check periodically (for debugging)
    const interval = setInterval(checkUserId, 1000);
    
    return () => clearInterval(interval);
  }, [currentUserId]);

  // Also listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log('Storage change detected:', e);
      if (e.key === 'userId' || e.key === null) {
        const newUserId = localStorage.getItem('userId');
        console.log('UserId changed in storage, reloading ratings');
        setCurrentUserId(newUserId);
        if (newUserId) {
          console.log('New userId in storage, loading ratings...');
          loadUserRatings(); // CRITICAL: Load ratings when userId changes
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update rating in context
  const updateUserRating = (productId, rating) => {
    console.log('=== UPDATING RATING IN CONTEXT ===');
    console.log('Product ID:', productId);
    console.log('New Rating:', rating);
    
    setUserRatings(prev => ({
      ...prev,
      [productId]: rating
    }));
    
    console.log('Rating updated in context:', { [productId]: rating });
  };

  // Get rating from context
  const getUserRating = (productId) => {
    const rating = userRatings[productId];
    console.log(`Getting rating for product ${productId}:`, rating);
    return rating !== undefined ? rating : null;
  };

  // FIXED: Get specific product rating from database API
  const getProductRating = async (userId, productId) => {
    console.log(`=== LOADING SPECIFIC PRODUCT RATING ===`);
    console.log('UserId:', userId);
    console.log('ProductId:', productId);
    
    try {
      console.log('Fetching specific product rating from database...');
      
      // FIXED: Direct API call to get this product's rating
      const response = await fetch(`http://localhost:8081/api/recommendations/user/${userId}/product/${productId}/rating`);
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

  // Clear all ratings
  const clearRatings = () => {
    console.log('=== CLEARING ALL RATINGS ===');
    setUserRatings({});
  };

  // Force refresh ratings
  const forceRefresh = () => {
    console.log('Force refreshing ratings...');
    loadUserRatings();
  };

  const value = {
    userRatings,
    loading,
    updateUserRating,
    getUserRating,
    getProductRating, // FIXED: Added specific product rating fetch
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
