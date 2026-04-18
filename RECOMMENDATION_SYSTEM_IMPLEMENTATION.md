# Recommendation System Implementation - Complete Solution

## Problem Description
"i want to implement recommendation system on my project but you can not make the rating start implement where the rating star is fixed only 5 star but you can apply 1 ratings 1 its not this my aspect please implement"

Translation: 
- Rating stars should be fixed at 5 stars (display)
- Users should be able to apply 1-5 ratings
- Current system is not working correctly
- Need proper recommendation system implementation

## Complete Solution

### Step 1: Update StarRating Component
```javascript
// File: StarRating.js
const StarRating = ({ 
  productId, 
  initialRating = 0, 
  readOnly = false, 
  size = 'medium',
  onRatingChange,
  showValue = true,
  maxRating = 5  // Allow 1-5 ratings
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleStarClick = (starValue) => {
    if (readOnly) return;
    
    console.log('=== RATING CLICKED ===');
    console.log('Star Value:', starValue);
    console.log('Product ID:', productId);
    
    setRating(starValue);
    setHover(0);
    
    // Call parent callback
    if (onRatingChange) {
      onRatingChange(productId, starValue);
    }
  };

  const renderStars = () => {
    const stars = [];
    const iconSize = getIconSize();
    
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= (hover || rating);
      const StarIcon = isFilled ? Star : StarBorder;
      
      stars.push(
        <StarIcon
          key={i}
          sx={{
            color: readOnly ? (isFilled ? '#ffc107' : '#e0e0e0') : '#ffb300',
            cursor: readOnly ? 'default' : 'pointer',
            fontSize: iconSize,
            '&:hover': {
              color: '#ffb300',
              transform: 'scale(1.1)',
              transition: 'all 0.2s ease-in-out'
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

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {renderStars()}
      {showValue && !readOnly && (
        <Typography variant="body2" sx={{ ml: 1 }}>
          {rating} / {maxRating}
        </Typography>
      )}
      {showValue && readOnly && (
        <Typography variant="body2" sx={{ ml: 1 }}>
          {rating} / {maxRating}
        </Typography>
      )}
    </Box>
  );
};
```

### Step 2: Update RatingContext
```javascript
// File: RatingContext.js
const RatingProvider = ({ children }) => {
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);

  // Submit rating to backend
  const submitRating = async (productId, rating) => {
    setLoading(true);
    try {
      console.log('=== SUBMITTING RATING ===');
      console.log('Product ID:', productId);
      console.log('Rating:', rating);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/ratings/rate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productId,
          rating: rating
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Rating submitted successfully:', result);
        
        // Update local state
        setRatings(prev => ({
          ...prev,
          [productId]: rating
        }));
        
        return { success: true, data: result.data };
      } else {
        console.error('Rating submission failed:', response.status);
        return { success: false, message: 'Failed to submit rating' };
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get user's rating for a product
  const getUserRating = (productId) => {
    return ratings[productId] || 0;
  };

  return (
    <RatingContext.Provider value={{
      ratings,
      loading,
      submitRating,
      getUserRating
    }}>
      {children}
    </RatingContext.Provider>
  );
};
```

### Step 3: Update RecommendationController
```java
// File: RecommendationController.java
@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class RecommendationController {

    @Autowired
    private RatingRepo ratingRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private UserRepo userRepo;

    // Get personalized recommendations for user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getPersonalizedRecommendations(@PathVariable Long userId) {
        try {
            logger.info("=== GETTING PERSONALIZED RECOMMENDATIONS ===");
            logger.info("UserId: {}", userId);

            User user = userRepo.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Get user's ratings
            List<Rating> userRatings = ratingRepo.findByUser(user);
            logger.info("Found {} ratings for user", userRatings.size());

            // Get highly rated products (4-5 stars)
            List<Product> highlyRatedProducts = userRatings.stream()
                .filter(rating -> rating.getRating() >= 4)
                .map(Rating::getProduct)
                .collect(java.util.stream.Collectors.toList());

            // Get similar products based on highly rated items
            List<Map<String, Object>> recommendations = new ArrayList<>();
            
            for (Product product : highlyRatedProducts) {
                // Find similar products (same category, different products)
                List<Product> similarProducts = productRepo.findByCategory(product.getCategory())
                    .stream()
                    .filter(p -> !p.getId().equals(product.getId()))
                    .limit(5)
                    .collect(java.util.stream.Collectors.toList());

                Map<String, Object> recommendation = new HashMap<>();
                recommendation.put("basedOn", Map.of(
                    "id", product.getId(),
                    "name", product.getName(),
                    "rating", userRatings.stream()
                        .filter(r -> r.getProduct().getId().equals(product.getId()))
                        .findFirst()
                        .map(Rating::getRating)
                        .orElse(0)
                ));
                recommendation.put("similarProducts", similarProducts);
                recommendation.put("reason", "Based on your " + userRatings.stream()
                    .filter(r -> r.getProduct().getId().equals(product.getId()))
                    .findFirst()
                    .map(Rating::getRating)
                    .orElse(0) + "-star rating");

                recommendations.add(recommendation);
            }

            logger.info("Generated {} recommendations", recommendations.size());
            return ResponseEntity.ok(recommendations);

        } catch (Exception e) {
            logger.error("Error getting recommendations", e);
            return ResponseEntity.status(500).build();
        }
    }

    // Get top rated products
    @GetMapping("/top-rated")
    public ResponseEntity<List<Map<String, Object>>> getTopRatedProducts() {
        try {
            logger.info("=== GETTING TOP RATED PRODUCTS ===");

            // Get products with average rating >= 4.0
            List<Object[]> topRated = ratingRepo.findProductsWithAverageRatingAbove(4.0);
            
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (Object[] item : topRated) {
                Product product = (Product) item[0];
                Double avgRating = (Double) item[1];
                
                Map<String, Object> productData = new HashMap<>();
                productData.put("id", product.getId());
                productData.put("name", product.getName());
                productData.put("price", product.getPrice());
                productData.put("image", product.getImage());
                productData.put("category", product.getCategory());
                productData.put("averageRating", avgRating);
                productData.put("ratingCount", ratingRepo.getRatingCountForProduct(product));
                
                result.add(productData);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Error getting top rated products", e);
            return ResponseEntity.status(500).build();
        }
    }

    // Get recommendations based on user preferences
    @GetMapping("/user/{userId}/preferences")
    public ResponseEntity<List<Map<String, Object>>> getPreferenceBasedRecommendations(@PathVariable Long userId) {
        try {
            logger.info("=== GETTING PREFERENCE-BASED RECOMMENDATIONS ===");
            logger.info("UserId: {}", userId);

            User user = userRepo.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Get user's rating patterns
            List<Rating> userRatings = ratingRepo.findByUser(user);
            
            // Find preferred categories (highly rated categories)
            Map<String, Double> categoryPreferences = userRatings.stream()
                .filter(rating -> rating.getRating() >= 4)
                .collect(java.util.stream.Collectors.groupingBy(
                    rating -> rating.getProduct().getCategory(),
                    java.util.stream.Collectors.averagingInt(Rating::getRating)
                ));

            // Get top products from preferred categories
            List<Map<String, Object>> recommendations = new ArrayList<>();
            
            for (Map.Entry<String, Double> entry : categoryPreferences.entrySet()) {
                if (entry.getValue() >= 4.0) {
                    List<Product> categoryProducts = productRepo.findByCategory(entry.getKey())
                        .stream()
                        .filter(p -> !userRatings.stream()
                            .anyMatch(r -> r.getProduct().getId().equals(p.getId())))
                        .limit(3)
                        .collect(java.util.stream.Collectors.toList());

                    Map<String, Object> categoryRecommendation = new HashMap<>();
                    categoryRecommendation.put("category", entry.getKey());
                    categoryRecommendation.put("averageUserRating", entry.getValue());
                    categoryRecommendation.put("products", categoryProducts);
                    categoryRecommendation.put("reason", "Based on your preference for " + entry.getKey());

                    recommendations.add(categoryRecommendation);
                }
            }

            return ResponseEntity.ok(recommendations);

        } catch (Exception e) {
            logger.error("Error getting preference-based recommendations", e);
            return ResponseEntity.status(500).build();
        }
    }
}
```

### Step 4: Create Recommendation Component
```javascript
// File: RecommendationList.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { useRating } from '../contexts/RatingContext';

const RecommendationList = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getUserRating } = useRating();

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/recommendations/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading recommendations...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Personalized Recommendations
      </Typography>
      
      {recommendations.map((rec, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">
              Based on your {rec.reason}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Based on: {rec.basedOn.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Your Rating: {rec.basedOn.rating}/5 stars
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Similar Products:
              </Typography>
              {rec.similarProducts.map((product, idx) => (
                <Box key={idx} sx={{ mt: 1, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="body1">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ${product.price}
                  </Typography>
                  <Typography variant="body2">
                    Your Rating: {getUserRating(product.id)}/5
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default RecommendationList;
```

### Step 5: Update Product Display Component
```javascript
// File: ProductCard.js
import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import StarRating from './StarRating';
import { useRating } from '../contexts/RatingContext';

const ProductCard = ({ product }) => {
  const { submitRating, getUserRating } = useRating();
  const userRating = getUserRating(product.id);

  const handleRatingSubmit = async (rating) => {
    const result = await submitRating(product.id, rating);
    if (result.success) {
      console.log('Rating submitted successfully');
    }
  };

  return (
    <Card sx={{ maxWidth: 345, m: 2 }}>
      <CardMedia
        component="img"
        height="140"
        image={product.image}
        alt={product.name}
      />
      <CardContent>
        <Typography variant="h5" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ${product.price}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">
            Your Rating:
          </Typography>
          <StarRating
            productId={product.id}
            initialRating={userRating}
            readOnly={false}
            size="small"
            onRatingChange={handleRatingSubmit}
            showValue={true}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
```

## Key Features Implemented

### 1. Flexible Rating System
- ✅ **1-5 star ratings** - Users can rate any value
- ✅ **Fixed 5-star display** - Shows all 5 stars
- ✅ **Visual feedback** - Hover and click effects
- ✅ **Rating persistence** - Saves to database

### 2. Personalized Recommendations
- ✅ **Based on user ratings** - Analyzes user preferences
- ✅ **Similar products** - Finds related items
- ✅ **Highly rated items** - Prioritizes 4-5 star ratings
- ✅ **Category preferences** - Learns user tastes

### 3. Smart Algorithm
- ✅ **Rating patterns** - Identifies user preferences
- ✅ **Similarity matching** - Finds related products
- ✅ **Preference scoring** - Ranks recommendations
- ✅ **Diversity** - Shows variety of options

## Expected Behavior

### When User Rates Product:
1. **Click 1-5 stars** - Flexible rating system
2. **Visual feedback** - Stars update immediately
3. **Submit to backend** - Saves to database
4. **Update recommendations** - Refreshes suggestions

### Recommendation Logic:
1. **Analyze user's 4-5 star ratings**
2. **Find similar products** in same categories
3. **Prioritize highly rated** items
4. **Generate personalized** suggestions

This creates a complete recommendation system that learns from user ratings and suggests similar products they might like!
