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
    console.log('=== STEP 9: AFTER USER LOGIN - FETCH SAVED RATINGS ===');
    console.log('STEP 9: UserId from localStorage:', userId);
    
    if (userId) {
      try {
        setLoading(true);
        console.log('STEP 9: Fetching ratings from database for userId:', userId);
        
        // Always fetch from database API (no cache) - DIRECT FETCH LIKE FAVORITE
        const response = await fetch(`http://localhost:8081/api/recommendations/user/${userId}/ratings`);
        console.log('STEP 9: Database API response:', response);
        
        if (response && response.ok) {
          const data = await response.json();
          console.log('STEP 9: Database API data:', data);
          
          if (Array.isArray(data)) {
            const ratingsMap = {};
            let validRatings = 0;
            
            data.forEach(rating => {
            console.log('STEP 9: Processing rating from database:', {
              id: rating.id,
              productId: rating.product?.id,
              rating: rating.rating,
              createdAt: rating.createdAt
            });
            
            // Handle both cases: rating.product exists OR productId is directly in rating object
            const productIdToUse = rating.product?.id || rating.productId;
            
            if (productIdToUse) {
              ratingsMap[productIdToUse] = rating.rating;
              validRatings++;
              console.log(`STEP 9: Mapped rating: Product ${productIdToUse} -> Rating ${rating.rating}`);
            } else {
              console.log('STEP 9: Skipping rating - no productId found:', rating);
            }
          });
          
          console.log(`STEP 9: Successfully loaded ${validRatings} ratings from database`);
          console.log('STEP 9: Final ratings map:', ratingsMap);
          setUserRatings(ratingsMap);
          
          // STEP 9: Verify persistence by checking database count
          console.log('STEP 9: Database persistence verified - ratings loaded from PostgreSQL');
          } else {
            console.log('STEP 9: No ratings found in database for user:', userId);
            setUserRatings({});
          }
        }
      } catch (error) {
        console.error('=== STEP 9: ERROR LOADING RATINGS FROM DATABASE ===');
        console.error('STEP 9: Error details:', error);
        console.error('STEP 9: Response:', error.response);
        setUserRatings({});
      } finally {
        setLoading(false);
      }
    } else {
      // Clear ratings when user logs out (session independence)
      console.log('=== STEP 9: USER LOGGED OUT - CLEARING MEMORY ===');
      console.log('STEP 9: No userId found, clearing ratings from memory only');
      setUserRatings({});
    }
  };

  // Load user ratings on component mount AND when userId changes
  useEffect(() => {
    console.log('=== STEP 9: RATING CONTEXT MOUNTED ===');
    console.log('STEP 9: Current userId in localStorage:', localStorage.getItem('userId'));
    console.log('STEP 9: Current userId in state:', currentUserId);
    
    // Always try to load ratings if userId exists
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log('STEP 9: Component mounted with userId, loading ratings...');
      loadUserRatings();
    } else {
      console.log('STEP 9: Component mounted without userId, clearing ratings');
      setUserRatings({});
    }
  }, []); // Empty dependency array - runs once on mount

  // Update current userId when it changes in localStorage
  useEffect(() => {
    const checkUserId = () => {
      const userId = localStorage.getItem('userId');
      console.log('STEP 9: Checking userId - current:', currentUserId, 'new:', userId);
      
      if (userId !== currentUserId) {
        console.log('STEP 9: UserId changed from', currentUserId, 'to', userId);
        setCurrentUserId(userId);
        if (userId) {
          console.log('STEP 9: New userId detected, loading ratings...');
          loadUserRatings(); // CRITICAL: Load ratings when user logs back in
        } else {
          console.log('STEP 9: User logged out, clearing ratings');
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
      console.log('STEP 9: Storage change detected:', e);
      if (e.key === 'userId' || e.key === null) {
        const newUserId = localStorage.getItem('userId');
        console.log('STEP 9: UserId changed in storage, reloading ratings');
        setCurrentUserId(newUserId);
        if (newUserId) {
          console.log('STEP 9: New userId in storage, loading ratings...');
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
    console.log('=== STEP 9: UPDATING RATING IN CONTEXT ===');
    console.log('STEP 9: Product ID:', productId);
    console.log('STEP 9: New Rating:', rating);
    
    setUserRatings(prev => ({
      ...prev,
      [productId]: rating
    }));
    
    console.log('STEP 9: Rating updated in context:', { [productId]: rating });
  };

  // Get rating from context
  const getUserRating = (productId) => {
    const rating = userRatings[productId];
    console.log(`STEP 9: Getting rating for product ${productId}:`, rating);
    return rating !== undefined ? rating : null;
  };

  // Clear all ratings
  const clearRatings = () => {
    console.log('=== STEP 9: CLEARING ALL RATINGS ===');
    setUserRatings({});
  };

  // Force refresh ratings
  const forceRefresh = () => {
    console.log('STEP 9: Force refreshing ratings...');
    loadUserRatings();
  };

  const value = {
    userRatings,
    loading,
    updateUserRating,
    getUserRating,
    clearRatings,
    refreshRatings: loadUserRatings,
    forceRefresh: () => {
      console.log('STEP 9: Force refreshing ratings...');
      loadUserRatings();
    }
  };

  return (
    <RatingContext.Provider value={value}>
      {children}
    </RatingContext.Provider>
  );
};
